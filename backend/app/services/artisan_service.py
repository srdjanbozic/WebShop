# app/services/artisan_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Product, OrderItem, Order
from app.schemas import ProductCreate

class ArtisanService:
    @staticmethod
    def create_product_for_artisan(db: Session, product_data: ProductCreate, artisan_id: int):
        """Create a product for specific artisan"""
        product = Product(**product_data.dict(), artisan_id=artisan_id)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def get_artisan_products(db: Session, artisan_id: int):
        """Get all products for an artisan"""
        return db.query(Product).filter(Product.artisan_id == artisan_id).all()
    
    @staticmethod
    def get_artisan_stats(db: Session, artisan_id: int):
        """Get statistics for an artisan"""
        # Broj proizvoda
        product_count = db.query(Product).filter(Product.artisan_id == artisan_id).count()
        
        # Broj jedinstvenih porudžbina
        order_count = db.query(OrderItem).join(Product).filter(
            Product.artisan_id == artisan_id
        ).distinct(OrderItem.order_id).count()
        
        # Ukupna zarada (samo plaćene porudžbine)
        total_revenue = db.query(
            func.sum(OrderItem.quantity * OrderItem.price)
        ).join(Product).filter(
            Product.artisan_id == artisan_id,
            OrderItem.order.has(Order.status == "paid")
        ).scalar() or 0
        
        return {
            "total_products": product_count,
            "total_orders": order_count,
            "total_revenue": round(total_revenue, 2)
        }
    
    @staticmethod
    def update_artisan_product(db: Session, product_id: int, artisan_id: int, product_data: dict):
        """Update artisan's product"""
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.artisan_id == artisan_id
        ).first()
        
        if not product:
            return None
        
        for field, value in product_data.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def delete_artisan_product(db: Session, product_id: int, artisan_id: int):
        """Delete artisan's product"""
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.artisan_id == artisan_id
        ).first()
        
        if not product:
            return False
        
        db.delete(product)
        db.commit()
        return True