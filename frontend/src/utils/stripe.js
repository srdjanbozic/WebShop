// utils/stripe.js
export const loadStripe = async () => {
  if (!window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
    });
  }
  return window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
};