// pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/orderAPI';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartState, clearCart } = useCart();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Pripremi order podatke za backend
            const orderData = {
                items: cartState.items.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    quantity: item.quantity
                })),
                total_amount: finalTotal,
                shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
            };

            // 2. Kreiraj Stripe Checkout session preko backend-a
            const { checkout_url, session_id, order_id } = await orderAPI.createCheckoutSession(orderData);

            // 3. Očisti cart jer krećemo na plaćanje
            clearCart();

            // 4. Redirect na Stripe Checkout page
            window.location.href = checkout_url;

        } catch (error) {
            console.error('Checkout error:', error);
            alert(error.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartState.items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some items to your cart before checkout</p>
                    <button onClick={() => navigate('/products')} className="cta-button">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const shippingCost = cartState.total > 500 ? 0 : 49.99;
    const finalTotal = cartState.total + shippingCost;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>Checkout</h1>

                <div className="checkout-content">
                    {/* Shipping Information */}
                    <div className="checkout-form-section">
                        <h2>Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="shipping-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={shippingInfo.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address *</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={shippingInfo.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="postalCode">Postal Code *</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={shippingInfo.postalCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="country">Country *</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={shippingInfo.country}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Payment Section */}
                            <div className="payment-section">
                                <h3>Payment</h3>
                                <div className="payment-method">
                                    <div className="payment-info">
                                        <p>💳 Credit/Debit Card (Stripe)</p>
                                        <small>You will be redirected to secure Stripe checkout</small>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="pay-now-btn"
                                disabled={loading}
                            >
                                {loading ? 'Redirecting to Payment...' : `Pay $${finalTotal.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>Order Summary</h2>

                        <div className="order-items">
                            {cartState.items.map(item => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image_url} alt={item.name} />
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <div className="item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>${cartState.total.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping:</span>
                                <span>
                                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                                    {cartState.total < 500 && (
                                        <small>Free shipping on orders over $500</small>
                                    )}
                                </span>
                            </div>
                            <div className="total-row final-total">
                                <span>Total:</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;