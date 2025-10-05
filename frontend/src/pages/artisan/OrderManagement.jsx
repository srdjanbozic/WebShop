// pages/artisan/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { artisanService } from '../../services/artisanService';
import './Artisan.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await artisanService.getMyOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            paid: '#28a745',
            shipped: '#17a2b8',
            completed: '#6c757d',
            cancelled: '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    if (loading) {
        return (
            <div className="artisan-container">
                <div className="artisan-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="artisan-container">
                <div className="artisan-error">
                    <h3>Error Loading Orders</h3>
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="artisan-container">
            <div className="page-header">
                <div>
                    <h1>My Orders</h1>
                    <p>Orders containing your products ({orders.length} total)</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h3>No Orders Yet</h3>
                    <p>When customers order your products, they will appear here.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="artisan-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <strong>{order.customer?.full_name || 'Unknown'}</strong>
                                            <small>{order.customer?.email || ''}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{formatCurrency(order.total_amount)}</strong>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`payment-status ${order.payment_status}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <div className="order-items">
                                            {order.items?.filter(item =>
                                                item.product?.artisan_id === order.customer_id
                                            ).map(item => (
                                                <div key={item.id} className="order-item">
                                                    {item.product?.name} (x{item.quantity})
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;