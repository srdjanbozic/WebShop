// pages/OrderConfirmation.jsx
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { orderId, total, items } = location.state || {};

    // Ako nema order data, redirect na home
    if (!orderId) {
        navigate('/');
        return null;
    }

    return (
        <div className="order-confirmation-page">
            <div className="confirmation-container">
                <div className="confirmation-header">
                    <div className="success-icon">✓</div>
                    <h1>Order Confirmed!</h1>
                    <p className="order-number">Order #: {orderId}</p>
                    <p className="confirmation-message">
                        Thank you for your purchase. We've sent a confirmation email with your order details.
                    </p>
                </div>

                <div className="confirmation-content">
                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="order-items">
                            {items.map(item => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image_url} alt={item.name} />
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>Quantity: {item.quantity}</p>
                                        <p className="item-price">${item.price} each</p>
                                    </div>
                                    <div className="item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-total">
                            <strong>Total: ${total.toFixed(2)}</strong>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="shipping-info-section">
                        <h2>What's Next?</h2>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-marker">1</div>
                                <div className="timeline-content">
                                    <h4>Order Processing</h4>
                                    <p>We're preparing your items for shipment</p>
                                    <small>Estimated: 1-2 business days</small>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">2</div>
                                <div className="timeline-content">
                                    <h4>Shipping</h4>
                                    <p>Your order will be shipped via premium carrier</p>
                                    <small>Estimated: 3-5 business days</small>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">3</div>
                                <div className="timeline-content">
                                    <h4>Delivery</h4>
                                    <p>Your luxury furniture arrives at your doorstep</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="confirmation-actions">
                    <Link to="/products" className="continue-shopping-btn">
                        Continue Shopping
                    </Link>
                    <button onClick={() => window.print()} className="print-btn">
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;