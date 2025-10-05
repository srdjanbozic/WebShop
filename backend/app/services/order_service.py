from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate

class OrderService:
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate, customer_id: int):
        # Validate stock and calculate total
        total_amount = 0
        order_items = []
        
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            # BUSINESS LOGIC: Check stock availability
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Not enough stock for {product.name}. Available: {product.stock}"
                )
            
            # BUSINESS LOGIC: Update stock
            product.stock -= item.quantity
            
            item_total = item.quantity * product.price
            total_amount += item_total
            
            order_items.append(OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                price=product.price
            ))
        
        # Create order
        db_order = Order(
            customer_id=customer_id,
            total_amount=total_amount,
            shipping_address=order_data.shipping_address,
            items=order_items
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        return db_order

    @staticmethod
    def get_user_orders(db: Session, user_id: int):
        return db.query(Order).filter(Order.customer_id == user_id).all()

    @staticmethod
    def get_order(db: Session, order_id: int, user_id: int):
        order = db.query(Order).filter(Order.id == order_id, Order.customer_id == user_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order