# app/routes/customer.py - NOVI FAJL
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Order, OrderItem, Product
from app.schemas import OrderResponse, UserResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/orders", response_model=list[OrderResponse])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current customer's orders"""
    orders = db.query(Order).filter(Order.customer_id == current_user.id).all()
    return orders

@router.get("/profile", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current customer's profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_my_profile(
    profile_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current customer's profile"""
    for field, value in profile_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user