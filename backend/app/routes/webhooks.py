# app/routes/webhooks.py - KREIRAJ OVAJ FAJL!
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import stripe
from app.database import get_db
from app.models import Order, Product

router = APIRouter()

# Funkcija za update stock-a
async def update_product_stock(order_id: int, db: Session):
    """Update product stock after successful payment"""
    try:
        print(f"🔄 Starting stock update for order {order_id}")
        
        # Pronađi order i njegove iteme
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        print(f"📦 Found order with {len(order.items)} items")
        
        # Prođi kroz sve order iteme i smanji stock
        for order_item in order.items:
            product = db.query(Product).filter(Product.id == order_item.product_id).first()
            if product:
                print(f"📊 Product: {product.name}, Current stock: {product.stock}, Ordered: {order_item.quantity}")
                
                if product.stock >= order_item.quantity:
                    product.stock -= order_item.quantity
                    print(f"✅ Stock updated: {product.name} -{order_item.quantity} (now: {product.stock})")
                else:
                    # Ovo bi trebalo da bude nemoguće jer smo već proverili
                    print(f"❌ Insufficient stock for {product.name}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Not enough stock for {product.name}. Available: {product.stock}, Ordered: {order_item.quantity}"
                    )
        
        db.commit()
        print("🎉 Stock update completed successfully!")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Stock update error: {str(e)}")
        raise e

@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    # Koristi Stripe webhook secret iz environment variables
    webhook_secret = "whsec_your_webhook_secret"  # Postavi ovo u .env fajl!
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        print("❌ Invalid payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print("❌ Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    print(f"🎯 Webhook event received: {event['type']}")

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        try:
            print(f"💰 Payment completed for session: {session.id}")
            
            # Pronađi order preko session_id
            order = db.query(Order).filter(Order.stripe_session_id == session.id).first()
            if order:
                print(f"📋 Found order: {order.id}")
                
                # 🔥 UPDATE STOCK OVDE!
                await update_product_stock(order.id, db)
                
                # Update order status
                order.payment_status = "completed"
                order.status = "paid"
                db.commit()
                
                print(f"✅ Order {order.id} completed and stock updated!")
            else:
                print(f"❌ Order not found for session: {session.id}")
                
        except Exception as e:
            print(f"❌ Webhook processing error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    return {"status": "success"}