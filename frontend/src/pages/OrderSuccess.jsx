// pages/OrderSuccess.jsx - UKLONITE ProtectedRoute
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (sessionId) {
            // Očisti cart jer je plaćanje uspešno
            clearCart();
            setLoading(false);
        } else {
            // Ako nema session_id, možda je direktan pristup - proveri da li ima order data
            navigate('/');
        }
    }, [searchParams, clearCart, navigate]);

    if (loading) {
        return (
            <div className="order-success-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h2>Processing your payment...</h2>
                    <p>Please wait while we confirm your order.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-success-page">
            <div className="success-container">
                <div className="success-header">
                    <div className="success-icon">🎉</div>
                    <h1>Payment Successful!</h1>
                    <p className="success-message">
                        Thank you for your purchase. Your order has been confirmed and is being processed.
                    </p>

                    {/* Prikaži user info samo ako je ulogovan */}
                    {user && (
                        <p className="user-info">
                            Order confirmation has been sent to: <strong>{user.email}</strong>
                        </p>
                    )}

                    <p className="order-details">
                        You will receive a confirmation email with your order details shortly.
                    </p>
                </div>

                <div className="success-content">
                    <div className="next-steps">
                        <h2>What's Next?</h2>
                        <div className="steps-timeline">
                            <div className="step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Order Processing</h4>
                                    <p>We're preparing your luxury furniture items</p>
                                    <small>1-2 business days</small>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Quality Check</h4>
                                    <p>Each piece undergoes final quality inspection</p>
                                    <small>1 business day</small>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Shipping</h4>
                                    <p>Your order will be carefully packaged and shipped</p>
                                    <small>3-5 business days</small>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h4>Delivery</h4>
                                    <p>Your luxury furniture arrives at your doorstep</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="success-actions">
                    <Link to="/products" className="continue-shopping-btn">
                        Continue Shopping
                    </Link>

                    {/* Prikaži "View Orders" samo ako je ulogovan */}
                    {user && (
                        <Link to="/dashboard" className="view-orders-btn">
                            View My Orders
                        </Link>
                    )}

                    <button onClick={() => window.print()} className="print-receipt-btn">
                        Print Receipt
                    </button>
                </div>

                <div className="support-info">
                    <p>
                        Need help? Contact our customer support at{' '}
                        <a href="mailto:support@luxurywood.com">support@luxurywood.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;