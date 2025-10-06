// pages/admin/CustomOrdersManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './Admin.css';

const CustomOrdersManagement = () => {
    const [customOrders, setCustomOrders] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log('🔄 Fetching custom orders and artisans...');
            const [ordersData, usersData] = await Promise.all([
                adminService.getAllCustomOrders(),
                adminService.getUsers()
            ]);

            console.log('🎨 Custom orders data received:', ordersData);
            console.log('👥 Users data received:', usersData);

            setCustomOrders(ordersData || []);
            // Filter only artisans
            const artisanUsers = (usersData || []).filter(user => user.role === 'artisan');
            setArtisans(artisanUsers);
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            setError(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const assignToArtisan = async (orderId, artisanId) => {
        try {
            await adminService.assignCustomOrder(orderId, artisanId);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('❌ Error assigning order:', error);
            alert('Failed to assign order to artisan');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // This would need a new endpoint or use the existing update

            console.log(`Updating order ${orderId} to status: ${newStatus}`);
            alert('Status update functionality to be implemented');
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
                    <p>Loading custom orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="admin-error">
                    <h3>Error Loading Custom Orders</h3>
                    <p>{error}</p>
                    <button onClick={fetchData} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Custom Orders Management</h1>
                <p>Manage custom order requests from customers ({customOrders.length} total)</p>
            </div>

            <div className="table-container">
                {customOrders.length === 0 ? (
                    <div className="no-data">
                        <p>No custom orders found</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Description</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Assigned Artisan</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <strong>{order.customer?.full_name || 'Unknown'}</strong>
                                            <small>{order.customer?.email || ''}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="description-truncate">
                                            {order.description.length > 50
                                                ? `${order.description.substring(0, 50)}...`
                                                : order.description
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        {order.budget ? (
                                            <strong>{formatCurrency(order.budget)}</strong>
                                        ) : (
                                            <span className="no-budget">Not specified</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${order.status}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {order.artisan ? (
                                            <span className="artisan-assigned">
                                                {order.artisan.full_name}
                                            </span>
                                        ) : (
                                            <select
                                                onChange={(e) => assignToArtisan(order.id, parseInt(e.target.value))}
                                                className="artisan-select"
                                            >
                                                <option value="">Assign Artisan</option>
                                                {artisans.map(artisan => (
                                                    <option key={artisan.id} value={artisan.id}>
                                                        {artisan.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <div className="order-actions">
                                            <button className="btn-view">View Details</button>
                                        </div>
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

export default CustomOrdersManagement;