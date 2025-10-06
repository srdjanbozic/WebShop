from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "customer"
    phone: Optional[str] = None
    address: Optional[str] = None
    

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    is_customizable: bool = False
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    artisan_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    product: ProductResponse
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderBase(BaseModel):
    shipping_address: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    total_amount: float

class OrderResponse(OrderBase):
    id: int
    customer_id: int
    total_amount: float
    status: str
    payment_status: str
    stripe_session_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True

# Custom Order Schemas
class CustomOrderBase(BaseModel):
    description: str
    dimensions: Optional[str] = None
    material_preference: Optional[str] = None
    budget: Optional[float] = None

class CustomOrderCreate(CustomOrderBase):
    pass

class CustomOrderUpdate(BaseModel):
    status: Optional[str] = None
    artisan_id: Optional[int] = None

class CustomOrderResponse(CustomOrderBase):
    id: int
    customer_id: int
    artisan_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    stripe_payment_intent_id: str
    amount: float
    status: str

class PaymentCreate(PaymentBase):
    order_id: int

class PaymentResponse(PaymentBase):
    id: int
    order_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ArtisanProfile(BaseModel):
    id: int
    full_name: str
    email: str
    
    joined_date: datetime
    
    class Config:
        from_attributes = True

class ArtisanStats(BaseModel):
    total_products: int
    total_orders: int
    total_revenue: float

class ArtisanProfileResponse(BaseModel):
    artisan: ArtisanProfile
    stats: ArtisanStats

class PublicArtisanResponse(BaseModel):
    artisan: ArtisanProfile
    products: List[ProductResponse]
    total_products: int
    
    class Config:
        from_attributes = True
        # Pagination Schemas
class PaginatedProductResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    total_pages: int
    has_next: bool
    has_prev: bool
    
    class Config:
        from_attributes = True