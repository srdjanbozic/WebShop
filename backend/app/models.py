from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="customer")  # customer, artisan, admin
    phone = Column(String)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    products = relationship("Product", back_populates="artisan")
    orders = relationship("Order", back_populates="customer")
    custom_orders_as_customer = relationship("CustomOrder", foreign_keys="CustomOrder.customer_id", back_populates="customer")
    custom_orders_as_artisan = relationship("CustomOrder", foreign_keys="CustomOrder.artisan_id", back_populates="artisan")
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String)  # chair, table, bed, wardrobe
    material = Column(String)  # oak, beech, walnut
    dimensions = Column(String)  # "100x50x80 cm"
    weight = Column(Float)
    is_customizable = Column(Boolean, default=False)
    artisan_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_url = Column(String)
    
    # Business logic constraints
    __table_args__ = (
        CheckConstraint('stock >= 0', name='stock_non_negative'),
        CheckConstraint('price >= 0', name='price_non_negative'),
    )
    
    # Relationships
    artisan = relationship("User", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product {self.name} (${self.price})>"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, paid, shipped, completed, cancelled
    payment_status = Column(String, default="pending")  # pending, completed, failed
    stripe_payment_intent_id = Column(String)
    stripe_session_id = Column(String)
    shipping_address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    paid_at = Column(DateTime(timezone=True))
    
    # Relationships
    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    
    def __repr__(self):
        return f"<Order {self.id} (${self.total_amount})>"

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # price at time of purchase
    
    # Business logic constraint
    __table_args__ = (
        CheckConstraint('quantity > 0', name='quantity_positive'),
    )
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem {self.id} (Qty: {self.quantity})>"

class CustomOrder(Base):
    __tablename__ = "custom_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    dimensions = Column(String)
    material_preference = Column(String)
    budget = Column(Float)
    status = Column(String, default="requested")  # requested, approved, in_progress, completed
    artisan_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Business logic constraint
    __table_args__ = (
        CheckConstraint('budget >= 0', name='budget_non_negative'),
    )
    
    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], back_populates="custom_orders_as_customer")
    artisan = relationship("User", foreign_keys=[artisan_id], back_populates="custom_orders_as_artisan")
    
    def __repr__(self):
        return f"<CustomOrder {self.id} ({self.status})>"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    stripe_payment_intent_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)  # succeeded, failed, processing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order")
    
    def __repr__(self):
        return f"<Payment {self.id} (${self.amount})>"