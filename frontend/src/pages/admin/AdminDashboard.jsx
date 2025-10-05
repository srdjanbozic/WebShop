// pages/admin/AdminDashboard.jsx - LEPŠA VERZIJA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import './Admin.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            console.log('🔄 Fetching dashboard data...');
            const data = await adminService.getDashboard();
            console.log('📊 Dashboard data received:', data);
            setDashboardData(data);
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="admin-error">
                    <h3>Error Loading Dashboard</h3>
                    <p>{error}</p>
                    <button onClick={fetchDashboardData} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, <strong>{user?.full_name}</strong>!</p>
                <div className="user-role-badge">
                    Role: <span className="role-admin">Administrator</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card users-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <p className="stat-number">{dashboardData?.overview?.total_users || 0}</p>
                        {dashboardData?.user_roles && (
                            <div className="stat-breakdown">
                                <span className="breakdown-item">
                                    <span className="dot admin-dot"></span>
                                    Admin: {dashboardData.user_roles.admin || 0}
                                </span>
                                <span className="breakdown-item">
                                    <span className="dot artisan-dot"></span>
                                    Artisan: {dashboardData.user_roles.artisan || 0}
                                </span>
                                <span className="breakdown-item">
                                    <span className="dot customer-dot"></span>
                                    Customer: {dashboardData.user_roles.customer || 0}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card products-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <h3>Total Products</h3>
                        <p className="stat-number">{dashboardData?.overview?.total_products || 0}</p>
                        <div className="stat-subtitle">Available in store</div>
                    </div>
                </div>

                <div className="stat-card orders-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                        <h3>Total Orders</h3>
                        <p className="stat-number">{dashboardData?.overview?.total_orders || 0}</p>
                        <div className="stat-breakdown">
                            <span className="breakdown-item recent">
                                Recent: {dashboardData?.overview?.recent_orders || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card revenue-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <p className="stat-number">{formatCurrency(dashboardData?.overview?.total_revenue)}</p>
                        <div className="stat-breakdown">
                            <span className="breakdown-item recent">
                                Recent: {formatCurrency(dashboardData?.overview?.recent_revenue)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Overview */}
            {dashboardData?.order_statuses && (
                <div className="section">
                    <h2>📊 Order Status Overview</h2>
                    <div className="status-grid">
                        {Object.entries(dashboardData.order_statuses).map(([status, count]) => (
                            <div key={status} className={`status-card status-${status}`}>
                                <span className={`status-indicator ${status}`}></span>
                                <div className="status-info">
                                    <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                    <span className="status-count">{count} orders</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="section">
                <h2>⚡ Quick Actions</h2>
                <div className="action-grid">
                    <Link to="/admin/users" className="action-card users-action">
                        <div className="action-icon">👥</div>
                        <div className="action-content">
                            <h3>Manage Users</h3>
                            <p>View and manage all users in the system</p>
                        </div>
                    </Link>

                    <Link to="/admin/products" className="action-card products-action">
                        <div className="action-icon">📦</div>
                        <div className="action-content">
                            <h3>Manage Products</h3>
                            <p>Add, edit, or remove products from store</p>
                        </div>
                    </Link>

                    <Link to="/admin/orders" className="action-card orders-action">
                        <div className="action-icon">🛒</div>
                        <div className="action-content">
                            <h3>Manage Orders</h3>
                            <p>View and update customer orders</p>
                        </div>
                    </Link>

                    <Link to="/admin/custom-orders" className="action-card custom-orders-action">
                        <div className="action-icon">🎨</div>
                        <div className="action-content">
                            <h3>Custom Orders</h3>
                            <p>Manage custom order requests</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;