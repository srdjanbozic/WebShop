from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import OrderCreate, OrderResponse, OrderItemCreate, OrderItemResponse
from app.dependencies import get_current_user
from app.services.stripe_service import StripeService

router = APIRouter()

# Pomocna funkcija za kreiranje ordera u bazi
def create_order_in_db(order_data: dict, user_id: int, db: Session):
    try:
        # Kreiraj order - KORISTI customer_id umesto user_id
        order = Order(
            customer_id=user_id,
            total_amount=order_data['total_amount'],
            status="pending",
            payment_status="pending",
            shipping_address=order_data.get('shipping_address', '')
        )
        db.add(order)
        db.flush()  # Get order ID without committing
        
        # Kreiraj order items
        for item_data in order_data['items']:
            # Proveri da li proizvod postoji i ima dovoljno na stanju
            product = db.query(Product).filter(Product.id == item_data['product_id']).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item_data['product_id']} not found")
            
            if product.stock < item_data['quantity']:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Not enough stock for {product.name}. Available: {product.stock}"
                )
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.add(order_item)
        
        db.commit()
        return order
        
    except Exception as e:
        db.rollback()
        raise e

@router.post("/create-checkout-session")
async def create_checkout_session(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        # 1. Kreiraj order u bazi (status: pending)
        order = create_order_in_db(order_data, current_user.id, db)
        
        # 2. Kreiraj Stripe Checkout Session
        success_url = f"http://localhost:3000/order-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = "http://localhost:3000/order-canceled"
        
        session = await StripeService.create_checkout_session({
            'order_id': order.id,
            'user_id': current_user.id,
            'items': order_data['items']
        }, success_url, cancel_url)
        
        # 3. Sačuvaj session ID u order
        order.stripe_session_id = session.id
        db.commit()
        
        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "order_id": order.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role == "admin":
        orders = db.query(Order).offset(skip).limit(limit).all()
    else:
        orders = db.query(Order).filter(Order.customer_id == current_user.id).offset(skip).limit(limit).all()
    
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Proveri autorizaciju
    if current_user.role != "admin" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update order status")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_data.get('status', order.status)
    order.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Order status updated successfully", "order": order}

@router.get("/users/{user_id}/orders", response_model=List[OrderResponse])
async def get_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Proveri autorizaciju
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    orders = db.query(Order).filter(Order.customer_id == user_id).all()
    return orders