// pages/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, customerAPI } from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const orderData = await orderAPI.getOrder(orderId);
            setOrder(orderData);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Order not found or you dont have permission to view it');

            // Fallback mock data
            setOrder(getMockOrderDetails(orderId));
        } finally {
            setLoading(false);
        }
    };

    const getMockOrderDetails = (id) => ({
        id: parseInt(id),
        order_number: `ORD-${id.toString().padStart(3, '0')}`,
        created_at: '2024-01-15T10:30:00',
        status: 'shipped',
        total_amount: 899.99,
        shipping_address: '123 Main Street, New York, NY 10001',
        customer_note: 'Please deliver between 9 AM - 5 PM',
        tracking_number: 'TRK123456789',
        estimated_delivery: '2024-01-20',
        items: [
            {
                id: 1,
                product: {
                    name: 'Oak Dining Table',
                    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
                },
                quantity: 1,
                price: 899.99
            }
        ],
        status_history: [
            { status: 'ordered', timestamp: '2024-01-15T10:30:00', note: 'Order placed' },
            { status: 'confirmed', timestamp: '2024-01-15T11:00:00', note: 'Order confirmed' },
            { status: 'processing', timestamp: '2024-01-16T09:15:00', note: 'Preparing for shipment' },
            { status: 'shipped', timestamp: '2024-01-17T14:20:00', note: 'Shipped with tracking' }
        ]
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#27ae60';
            case 'shipped': return '#3498db';
            case 'processing': return '#f39c12';
            case 'pending': return '#f39c12';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Delivered';
            case 'shipped': return 'Shipped';
            case 'processing': return 'Processing';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCancelOrder = async () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderAPI.cancelOrder(orderId);
                setOrder(prev => ({ ...prev, status: 'cancelled' }));
                alert('Order cancelled successfully!');
            } catch (error) {
                console.error('Error cancelling order:', error);
                alert('Error cancelling order. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="order-details-page">
                <div className="error">
                    <h2>Order Not Found</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="cta-button">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="order-details-container">
                {/* Header */}
                <div className="order-header">
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        ← Back to Orders
                    </button>
                    <div className="order-title">
                        <h1>Order #{order.order_number}</h1>
                        <p>Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {getStatusText(order.status)}
                    </div>
                </div>

                <div className="order-content">
                    {/* Left Column - Order Items & Details */}
                    <div className="order-left">
                        {/* Order Items */}
                        <div className="order-section">
                            <h2>Order Items</h2>
                            <div className="order-items-list">
                                {order.items.map(item => (
                                    <div key={item.id} className="order-item-detail">
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="item-image"
                                        />
                                        <div className="item-info">
                                            <h4>{item.product.name}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            <p className="item-price">${item.price}</p>
                                        </div>
                                        <div className="item-total">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="order-section">
                            <h2>Shipping Address</h2>
                            <div className="shipping-address">
                                <p>{order.shipping_address}</p>
                                {order.customer_note && (
                                    <div className="customer-note">
                                        <strong>Delivery Note:</strong> {order.customer_note}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="order-section">
                            <h2>Order Timeline</h2>
                            <div className="timeline">
                                {order.status_history.map((history, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4>{getStatusText(history.status)}</h4>
                                            <p>{formatDate(history.timestamp)}</p>
                                            <p className="timeline-note">{history.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary & Actions */}
                    <div className="order-right">
                        {/* Order Summary */}
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Order Actions */}
                        <div className="order-actions">
                            <h3>Order Actions</h3>

                            {/* Tracking */}
                            {order.tracking_number && (
                                <div className="tracking-info">
                                    <h4>Tracking Information</h4>
                                    <p><strong>Tracking #:</strong> {order.tracking_number}</p>
                                    {order.estimated_delivery && (
                                        <p><strong>Estimated Delivery:</strong> {formatDate(order.estimated_delivery)}</p>
                                    )}
                                    <button className="track-button">
                                        📦 Track Package
                                    </button>
                                </div>
                            )}

                            {/* Cancel Order */}
                            {(order.status === 'pending' || order.status === 'processing') && (
                                <button
                                    className="cancel-order-btn"
                                    onClick={handleCancelOrder}
                                >
                                    Cancel Order
                                </button>
                            )}

                            {/* Support */}
                            <div className="support-section">
                                <h4>Need Help?</h4>
                                <p>Contact our support team for assistance with your order.</p>
                                <button className="support-btn">
                                    📞 Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;