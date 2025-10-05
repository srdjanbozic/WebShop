from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CustomOrder, User
from app.schemas import CustomOrderCreate, CustomOrderUpdate, CustomOrderResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/custom-orders", response_model=List[CustomOrderResponse])
async def get_custom_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role == "admin":
        custom_orders = db.query(CustomOrder).offset(skip).limit(limit).all()
    elif current_user.role == "artisan":
        custom_orders = db.query(CustomOrder).filter(CustomOrder.artisan_id == current_user.id).offset(skip).limit(limit).all()
    else:
        custom_orders = db.query(CustomOrder).filter(CustomOrder.customer_id == current_user.id).offset(skip).limit(limit).all()
    
    return custom_orders

@router.get("/custom-orders/{order_id}", response_model=CustomOrderResponse)
async def get_custom_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    custom_order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    # Proveri autorizaciju
    if (current_user.role == "customer" and custom_order.customer_id != current_user.id) or \
       (current_user.role == "artisan" and custom_order.artisan_id != current_user.id) or \
       (current_user.role not in ["admin", "artisan", "customer"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return custom_order

@router.post("/custom-orders", response_model=CustomOrderResponse)
async def create_custom_order(
    order_data: CustomOrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create custom orders")
    
    custom_order = CustomOrder(
        **order_data.dict(),
        customer_id=current_user.id,
        status="requested"
    )
    db.add(custom_order)
    db.commit()
    db.refresh(custom_order)
    return custom_order

@router.put("/custom-orders/{order_id}", response_model=CustomOrderResponse)
async def update_custom_order(
    order_id: int,
    order_data: CustomOrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update custom orders")
    
    custom_order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    for field, value in order_data.dict(exclude_unset=True).items():
        setattr(custom_order, field, value)
    
    db.commit()
    db.refresh(custom_order)
    return custom_order

# ARTISAN SPECIFIC ENDPOINTS
@router.get("/artisan/custom-orders", response_model=List[CustomOrderResponse])
async def get_artisan_custom_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role not in ["artisan", "admin"]:
        raise HTTPException(status_code=403, detail="Only artisans and admin can access")
    
    custom_orders = db.query(CustomOrder).filter(CustomOrder.artisan_id == current_user.id).all()
    return custom_orders

@router.put("/artisan/custom-orders/{order_id}", response_model=CustomOrderResponse)
async def update_custom_order_status(
    order_id: int,
    status_data: CustomOrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role not in ["artisan", "admin"]:
        raise HTTPException(status_code=403, detail="Only artisans and admin can update orders")
    
    custom_order = db.query(CustomOrder).filter(CustomOrder.id == order_id).first()
    if not custom_order:
        raise HTTPException(status_code=404, detail="Custom order not found")
    
    # Proveri da li artisan radi na ovom orderu ili je admin
    if custom_order.artisan_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only update orders assigned to you")
    
    for field, value in status_data.dict(exclude_unset=True).items():
        setattr(custom_order, field, value)
    
    db.commit()
    db.refresh(custom_order)
    return custom_order