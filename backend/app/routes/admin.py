from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Product, Order, OrderItem, CustomOrder
from app.schemas import (
    UserResponse, ProductResponse, OrderResponse, CustomOrderResponse,
    ProductCreate, CustomOrderUpdate
)
from app.dependencies import require_admin

router = APIRouter()

# ===== ADMIN DASHBOARD =====
@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin dashboard statistics"""
    
    # Osnovne statistike
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).filter(Order.status == "paid").scalar() or 0
    
    # Statistike po danu (poslednjih 7 dana)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_orders = db.query(Order).filter(Order.created_at >= week_ago).count()
    recent_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status == "paid", 
        Order.created_at >= week_ago
    ).scalar() or 0
    
    # Order status breakdown
    order_statuses = db.query(
        Order.status, 
        func.count(Order.id)
    ).group_by(Order.status).all()
    
    # User role breakdown
    user_roles = db.query(
        User.role,
        func.count(User.id)
    ).group_by(User.role).all()
    
    return {
        "overview": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "recent_orders": recent_orders,
            "recent_revenue": round(recent_revenue, 2)
        },
        "order_statuses": dict(order_statuses),
        "user_roles": dict(user_roles)
    }

# ===== USER MANAGEMENT =====
@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_role = role_data.get("role")
    if new_role not in ["customer", "artisan", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = new_role
    db.commit()
    db.refresh(user)
    
    return {"message": f"User role updated to {new_role}", "user": user}

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Activate/deactivate user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = status_data.get("is_active", user.is_active)
    db.commit()
    db.refresh(user)
    
    status_text = "activated" if user.is_active else "deactivated"
    return {"message": f"User {status_text}", "user": user}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

# ===== PRODUCT MANAGEMENT =====
@router.get("/products", response_model=List[ProductResponse])
async def get_all_products_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all products with full details (admin only)"""
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@router.post("/products", response_model=ProductResponse)
async def create_product_admin(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create product as admin (can assign to any artisan)"""
    product = Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}/stock")
async def update_product_stock(
    product_id: int,
    stock_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update product stock (admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    new_stock = stock_data.get("stock")
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")
    
    product.stock = new_stock
    db.commit()
    db.refresh(product)
    
    return {"message": "Product stock updated", "product": product}

# ===== ORDER MANAGEMENT =====
@router.get("/orders", response_model=List[OrderResponse])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all orders with filtering (admin only)"""
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.offset(skip).limit(limit).all()
    return orders

@router.put("/orders/{order_id}/status")
async def update_order_status_admin(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update order status (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = status_data.get("status")
    valid_statuses = ["pending", "paid", "shipped", "completed", "cancelled"]
    
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = new_status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    
    return {"message": f"Order status updated to {new_status}", "order": order}

# ===== CUSTOM ORDERS MANAGEMENT =====
@router.get("/custom-orders", response_model=List[CustomOrderResponse])
async def get_all_custom_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all custom orders (admin only)"""
    custom_orders = db.query(CustomOrder).offset(skip).limit(limit).all()
    return custom_orders

@router.put("/custom-orders/{order_id}/assign")
async def assign_custom_order_to_artisan(
    order_id: int,
    assign_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Assign custom order to artisan (admin only)"""
    custom_order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    artisan_id = assign_data.get("artisan_id")
    artisan = db.query(User).filter(User.id == artisan_id, User.role == "artisan").first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")
    
    custom_order.artisan_id = artisan_id
    custom_order.status = "assigned"
    db.commit()
    db.refresh(custom_order)
    
    return {"message": f"Custom order assigned to artisan {artisan.full_name}", "order": custom_order}