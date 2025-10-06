# app/routes/orders.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Order, OrderItem, Product, User
from app.schemas import OrderCreate, OrderResponse, OrderItemCreate, OrderItemResponse
from app.dependencies import get_current_user
from app.services.stripe_service import StripeService

router = APIRouter()

# Funkcija za update stock-a nakon uspešnog plaćanja
def update_stock_after_payment(order_id: int, db: Session):
    """Update product stock after successful payment - CALL THIS IMMEDIATELY"""
    try:
        print(f"🔄 Updating stock for order {order_id}")
        
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            print("❌ Order not found for stock update")
            return False
        
        print(f"📦 Found order with {len(order.items)} items")
        
        for order_item in order.items:
            product = db.query(Product).filter(Product.id == order_item.product_id).first()
            if product:
                print(f"📊 Before update - {product.name}: Stock {product.stock}, Ordered: {order_item.quantity}")
                
                if product.stock >= order_item.quantity:
                    # SMANJI STOCK
                    product.stock -= order_item.quantity
                    print(f"✅ After update - {product.name}: Stock {product.stock}")
                else:
                    print(f"❌ Insufficient stock for {product.name}")
                    return False
        
        db.commit()
        print("🎉 Stock updated successfully!")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Stock update error: {str(e)}")
        return False

# Pomocna funkcija za kreiranje ordera u bazi
def create_order_in_db(order_data: dict, user_id: int, db: Session):
    try:
        # 🔥 PRVO PROVERI SVE STOCK-OVE PRE KREIRANJA ORDERA
        for item_data in order_data['items']:
            product = db.query(Product).filter(Product.id == item_data['product_id']).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item_data['product_id']} not found")
            
            if product.stock < item_data['quantity']:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Not enough stock for {product.name}. Available: {product.stock}, Requested: {item_data['quantity']}"
                )
        
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
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.add(order_item)
        
        db.commit()
        print(f"✅ Order {order.id} created successfully")
        return order
        
    except Exception as e:
        db.rollback()
        print(f"❌ Order creation error: {str(e)}")
        raise e

@router.post("/create-checkout-session")  # 👈 OVO ĆE BITI /api/v1/orders/create-checkout-session
async def create_checkout_session(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        print("🎯 CREATE CHECKOUT SESSION CALLED")
        print(f"📦 Order data: {order_data}")
        
        # 1. Kreiraj order u bazi (status: pending)
        order = create_order_in_db(order_data, current_user.id, db)
        print(f"✅ Order created: {order.id}")
        
        # 2. 🔥 DODAJ OVDE: SMANJI STOCK ODMAH NAKON KREIRANJA ORDERA
        print("🔄 Immediately updating stock after order creation...")
        update_stock_after_payment(order.id, db)
        print("✅ Stock updated immediately!")
        
        # 3. Kreiraj Stripe Checkout Session
        success_url = f"http://localhost:3000/order-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = "http://localhost:3000/order-canceled"
        
        session = await StripeService.create_checkout_session({
            'order_id': order.id,
            'user_id': current_user.id,
            'items': order_data['items']
        }, success_url, cancel_url)
        
        # 4. Sačuvaj session ID u order
        order.stripe_session_id = session.id
        db.commit()
        
        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "order_id": order.id
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error in create-checkout-session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[OrderResponse])  # 👈 OVO ĆE BITI /api/v1/orders/
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

@router.get("/{order_id}", response_model=OrderResponse)  # 👈 OVO ĆE BITI /api/v1/orders/{id}
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

@router.put("/{order_id}/status")
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