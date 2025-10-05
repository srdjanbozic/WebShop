from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import CustomOrder, User
from app.schemas import CustomOrderCreate, CustomOrderUpdate

class CustomOrderService:
    @staticmethod
    def create_custom_order(db: Session, custom_order: CustomOrderCreate, customer_id: int):
        db_custom_order = CustomOrder(
            **custom_order.dict(),
            customer_id=customer_id
        )
        db.add(db_custom_order)
        db.commit()
        db.refresh(db_custom_order)
        return db_custom_order

    @staticmethod
    def get_customer_custom_orders(db: Session, customer_id: int):
        return db.query(CustomOrder).filter(CustomOrder.customer_id == customer_id).all()

    @staticmethod
    def get_artisan_custom_orders(db: Session, artisan_id: int):
        return db.query(CustomOrder).filter(CustomOrder.artisan_id == artisan_id).all()

    @staticmethod
    def get_all_custom_orders(db: Session, skip: int = 0, limit: int = 100):
        return db.query(CustomOrder).offset(skip).limit(limit).all()

    @staticmethod
    def update_custom_order(db: Session, custom_order_id: int, update_data: CustomOrderUpdate, user: User):
        db_custom_order = db.query(CustomOrder).filter(CustomOrder.id == custom_order_id).first()
        if not db_custom_order:
            raise HTTPException(status_code=404, detail="Custom order not found")
        
        # Only admin, assigned artisan, or customer can update
        if user.role not in ["admin"] and db_custom_order.artisan_id != user.id and db_custom_order.customer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this custom order"
            )
        
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(db_custom_order, field, value)
        
        db.commit()
        db.refresh(db_custom_order)
        return db_custom_order