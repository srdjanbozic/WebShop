// pages/admin/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './Admin.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            console.log('🔄 Fetching orders...');
            const data = await adminService.getAllOrders();
            console.log('🛒 Orders data received:', data);
            setOrders(data || []);
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            setError(error.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            alert('Failed to update order status');
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

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="admin-error">
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
        <div className="admin-container">
            <div className="admin-header">
                <h1>Order Management</h1>
                <p>Manage all customer orders ({orders.length} total)</p>
            </div>

            <div className="table-container">
                {orders.length === 0 ? (
                    <div className="no-data">
                        <p>No orders found</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Actions</th>
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
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`status-select status-${order.status}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`payment-status ${order.payment_status}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <span className="items-count">
                                            {order.items?.length || 0} items
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-view">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;