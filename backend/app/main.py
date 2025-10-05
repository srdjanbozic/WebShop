from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import stripe
import os
from app.config import settings
from app.database import engine, get_db
from app.routes import admin
from app.routes import artisan
from app import models

# Import routes
from app.routes import auth, products, orders, custom_orders, customer

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Luxury Wood Furniture API",
    description="Backend API for luxury wood furniture e-commerce platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(artisan.router, prefix="/api/v1/artisan", tags=["artisan"])
app.include_router(products.router, prefix="/api/v1", tags=["products"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])
app.include_router(custom_orders.router, prefix="/api/v1", tags=["custom-orders"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["customer"])

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Luxury Wood Furniture API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Test database connection
@app.get("/test-db")
async def test_db():
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"database": "connected"}
    except Exception as e:
        return {"database": "error", "message": str(e)}

# Seed database endpoint (dodajte ovaj deo)
@app.post("/api/v1/seed-database")
async def seed_database_endpoint(db: Session = Depends(get_db)):
    """
    Seed the database with initial test data.
    This should only be used in development.
    """
    try:
        from app.seed_database import seed_database
        seed_database()
        return {"message": "Database seeded successfully with test data"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")

# Automatsko seedovanje pri pokretanju (development only)
@app.on_event("startup")
async def startup_event():
    """
    Automatically seed database on startup if in development mode.
    """
    if settings.DEBUG:  # Samo u development modu
        try:
            from app.seed_database import seed_database
            print("Checking if database needs seeding...")
            seed_database()
        except Exception as e:
            print(f" Auto-seeding skipped or failed: {e}")

# Stripe webhook endpoint
@app.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Obradi event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Pronađi order po session ID
        order = db.query(models.Order).filter(models.Order.stripe_session_id == session.id).first()
        if order:
            # Update order status na "paid"
            order.status = "paid"
            order.payment_status = "completed"
            order.paid_at = datetime.utcnow()
            
            # Smanji količine proizvoda (business logika)
            for item in order.order_items:
                product = item.product
                product.stock -= item.quantity
                if product.stock < 0:
                    product.stock = 0
            
            db.commit()
            print(f" Order {order.id} marked as paid")
    
    elif event['type'] == 'payment_intent.payment_failed':
        session = event['data']['object']
        
        order = db.query(models.Order).filter(models.Order.stripe_session_id == session.id).first()
        if order:
            order.payment_status = "failed"
            db.commit()
            print(f"Payment failed for order {order.id}")
    
    return {"status": "success", "event": event['type']}

# Only run this if the file is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)