from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Product, User
from app.schemas import ProductCreate, ProductResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create products")
    
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update products")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product_data.dict().items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete products")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# ARTISAN SPECIFIC ENDPOINTS
@router.get("/artisan/products", response_model=List[ProductResponse])
async def get_artisan_products(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role not in ["artisan", "admin"]:
        raise HTTPException(status_code=403, detail="Only artisans and admin can access")
    
    products = db.query(Product).filter(Product.artisan_id == current_user.id).all()
    return products

@router.post("/artisan/products", response_model=ProductResponse)
async def create_artisan_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role not in ["artisan", "admin"]:
        raise HTTPException(status_code=403, detail="Only artisans and admin can create products")
    
    # Proveri da li artisan pokušava da kreira product za drugog artisan-a
    if product_data.artisan_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only create products for yourself")
    
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/artisan/products/{product_id}", response_model=ProductResponse)
async def update_artisan_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role not in ["artisan", "admin"]:
        raise HTTPException(status_code=403, detail="Only artisans and admin can update products")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Proveri da li artisan poseduje proizvod ili je admin
    if product.artisan_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only update your own products")
    
    for field, value in product_data.dict().items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product