# app/routes/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models import Product, User
from app.schemas import ProductCreate, ProductResponse, PaginatedProductResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=PaginatedProductResponse) 
async def get_products(
    skip: int = 0,
    limit: int = 9,
    category: Optional[str] = None,
    material: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "name",
    search: Optional[str] = None,
    artisan_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    print("GET PRODUCTS API CALLED")
    # Osnovni query
    query = db.query(Product)
    
    # Filtriranje
    if category and category != "all":
        query = query.filter(Product.category == category)
    
    if material and material != "all":
        query = query.filter(Product.material == material)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Search implementacija
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
    
    if artisan_id:
        query = query.filter(Product.artisan_id == artisan_id)
    
    # Sortiranje
    if sort_by == "name":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    elif sort_by == "price":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    elif sort_by == "stock":
        query = query.order_by(Product.stock.desc())
    else:
        query = query.order_by(Product.name.asc())
    
    # Paginacija
    total_products = query.count()
    products = query.offset(skip).limit(limit).all()
    
    print(f"✅ Returning {len(products)} products")
    return PaginatedProductResponse(
        products=products,
        total=total_products,
        page=skip // limit + 1,
        total_pages=(total_products + limit - 1) // limit,
        has_next=skip + limit < total_products,
        has_prev=skip > 0
    )

@router.get("/{product_id}", response_model=ProductResponse)  # 👈 OVO ĆE BITI /api/v1/products/{id}
async def get_product(product_id: int, db: Session = Depends(get_db)):
    print(f"🎯 GET PRODUCT API CALLED: {product_id}")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    print(f"✅ Product found: {product.name}, Stock: {product.stock}")
    return product

@router.post("/", response_model=ProductResponse)
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

@router.put("/{product_id}", response_model=ProductResponse)
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

@router.delete("/{product_id}")
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
    
    if product.artisan_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only update your own products")
    
    for field, value in product_data.dict().items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product