from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Product
from app.schemas import ProductCreate

class ProductService:
    @staticmethod
    def get_products(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Product).offset(skip).limit(limit).all()

    @staticmethod
    def get_product(db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    @staticmethod
    def create_product(db: Session, product: ProductCreate, artisan_id: int):
        # Business logic validation
        if product.price <= 0:
            raise HTTPException(status_code=400, detail="Price must be positive")
        
        db_product = Product(
            **product.dict(),
            artisan_id=artisan_id
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def update_product(db: Session, product_id: int, product_update: ProductCreate, artisan_id: int):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if db_product.artisan_id != artisan_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this product")
        
        for field, value in product_update.dict().items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        return db_product

    @staticmethod
    def delete_product(db: Session, product_id: int, artisan_id: int):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if db_product.artisan_id != artisan_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this product")
        
        db.delete(db_product)
        db.commit()
        return {"message": "Product deleted successfully"}