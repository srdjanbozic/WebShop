# app/routes/artisan.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import User, Product, Order, OrderItem
from app.schemas import ProductCreate, ProductResponse, OrderResponse, ArtisanProfile, ArtisanStats, ArtisanProfileResponse, PublicArtisanResponse
from app.dependencies import get_current_user, require_artisan

router = APIRouter()

# ===== ARTISAN PRODUCT MANAGEMENT =====
@router.get("/products", response_model=List[ProductResponse])
async def get_artisan_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Get all products created by the current artisan"""
    products = db.query(Product).filter(Product.artisan_id == current_user.id).all()
    return products

@router.post("/products", response_model=ProductResponse)
async def create_artisan_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Create a new product as an artisan"""
    # Proveri da li artisan pokušava da kreira product za drugog artisan-a
    if hasattr(product_data, 'artisan_id') and product_data.artisan_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create products for yourself"
        )
    
    # Kreiraj product sa artisan_id = trenutni korisnik
    product_dict = product_data.dict()
    product_dict['artisan_id'] = current_user.id
    
    product = Product(**product_dict)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_artisan_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Update artisan's own product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.artisan_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to edit it"
        )
    
    for field, value in product_data.dict().items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
async def delete_artisan_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Delete artisan's own product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.artisan_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to delete it"
        )
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# ===== ARTISAN ORDER MANAGEMENT =====
@router.get("/orders", response_model=List[OrderResponse])
async def get_artisan_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Get orders that contain artisan's products"""
    # Pronađi sve order items koji sadrže proizvode ovog artisan-a
    order_items = db.query(OrderItem).join(Product).filter(
        Product.artisan_id == current_user.id
    ).all()
    
    # Grupiši po order-ima i uzmi jedinstvene order-e
    order_ids = list(set([item.order_id for item in order_items]))
    orders = db.query(Order).filter(Order.id.in_(order_ids)).all()
    
    return orders

# ===== ARTISAN PROFILE =====
@router.get("/profile", response_model=ArtisanProfileResponse)
async def get_artisan_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_artisan)
):
    """Get artisan's profile information"""
    # Broj proizvoda
    product_count = db.query(Product).filter(Product.artisan_id == current_user.id).count()
    
    # Broj jedinstvenih porudžbina
    order_count = db.query(OrderItem).join(Product).filter(
        Product.artisan_id == current_user.id
    ).distinct(OrderItem.order_id).count()
    
    # Ukupna zarada (samo plaćene porudžbine)
    total_revenue = db.query(
        func.sum(OrderItem.quantity * OrderItem.price)
    ).join(Product).filter(
        Product.artisan_id == current_user.id,
        OrderItem.order.has(Order.status == "paid")
    ).scalar() or 0
    
    artisan_profile = ArtisanProfile(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        joined_date=current_user.created_at
    )
    
    stats = ArtisanStats(
        total_products=product_count,
        total_orders=order_count,
        total_revenue=round(total_revenue, 2)
    )
    
    return ArtisanProfileResponse(
        artisan=artisan_profile,
        stats=stats
    )

# ===== PUBLIC ARTISAN ENDPOINTS =====
@router.get("/public/{artisan_id}", response_model=PublicArtisanResponse)
async def get_public_artisan_profile(
    artisan_id: int,
    db: Session = Depends(get_db)
):
    """Get public artisan profile (no authentication required)"""
    artisan = db.query(User).filter(
        User.id == artisan_id,
        User.role == "artisan",
        User.is_active == True
    ).first()
    
    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan not found"
        )
    
    # Uzmi sve aktivne proizvode artisan-a
    products = db.query(Product).filter(
        Product.artisan_id == artisan_id,
        Product.stock > 0
    ).all()
    
    artisan_profile = ArtisanProfile(
        id=artisan.id,
        full_name=artisan.full_name,
        email=artisan.email,
        joined_date=artisan.created_at
    )
    
    return PublicArtisanResponse(
        artisan=artisan_profile,
        products=products,
        total_products=len(products)
    )

@router.get("/public/{artisan_id}/products", response_model=List[ProductResponse])
async def get_public_artisan_products(
    artisan_id: int,
    db: Session = Depends(get_db)
):
    """Get all public products for an artisan"""
    artisan = db.query(User).filter(
        User.id == artisan_id,
        User.role == "artisan",
        User.is_active == True
    ).first()
    
    if not artisan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan not found"
        )
    
    products = db.query(Product).filter(
        Product.artisan_id == artisan_id,
        Product.stock > 0
    ).all()
    
    return products

@router.get("/public", response_model=List[ArtisanProfile])
async def get_all_artisans(
    db: Session = Depends(get_db)
):
    """Get all active artisans for public listing"""
    artisans = db.query(User).filter(
        User.role == "artisan",
        User.is_active == True
    ).all()
    
    return [ArtisanProfile(
        id=artisan.id,
        full_name=artisan.full_name,
        email=artisan.email,
        joined_date=artisan.created_at
    ) for artisan in artisans]