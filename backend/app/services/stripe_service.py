import stripe
import os
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    async def create_checkout_session(order_data: dict, success_url: str, cancel_url: str):
        try:
            # Kreiraj line items za Stripe
            line_items = []
            for item in order_data['items']:
                line_items.append({
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': item['name'],
                            'description': item.get('description', ''),
                        },
                        'unit_amount': int(item['price'] * 100),  # Stripe expects cents
                    },
                    'quantity': item['quantity'],
                })
            
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'order_id': str(order_data['order_id']),
                    'user_id': str(order_data['user_id'])
                }
            )
            return session
        except Exception as e:
            raise e

    @staticmethod
    async def retrieve_session(session_id: str):
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except Exception as e:
            raise e