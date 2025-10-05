// pages/artisan/ArtisanDashboard.jsx - MODIFIKUJ
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { artisanService } from '../../services/artisanService';
import './Artisan.css';

const ArtisanDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profile, products, orders] = await Promise.all([
                artisanService.getMyProfile(),
                artisanService.getMyProducts(),
                artisanService.getMyOrders()
            ]);

            setStats({
                totalProducts: products?.length || 0,
                totalOrders: orders?.length || 0,
                activeProducts: products?.filter(p => p.stock > 0)?.length || 0,
                pendingOrders: orders?.filter(o => o.status === 'pending')?.length || 0,
                totalRevenue: profile?.stats?.total_revenue || 0
            });
        } catch (error) {
            console.error('Error fetching artisan data:', error);
            setError('Failed to load dashboard data');
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

    if (loading) {
        return (
            <div className="artisan-container">
                <div className="artisan-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="artisan-container">
                <div className="artisan-error">
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
        <div className="artisan-container">
            <div className="artisan-header">
                <h1>Artisan Dashboard</h1>
                <p>Welcome back, {user?.full_name}! Manage your woodcraft creations.</p>
                <div className="user-role-badge">
                    Role: <span className="role-artisan">Artisan</span>
                </div>

                {/* 🔥 DODAJ PUBLIC PROFILE LINK */}
                <div className="public-profile-link">
                    <Link to={`/artisans/${user?.id}`} className="btn btn-outline">
                        👁️ View My Public Profile
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <h3>My Products</h3>
                        <p className="stat-number">{stats?.totalProducts || 0}</p>
                        <Link to="/artisan/products" className="stat-link">Manage Products</Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                        <h3>Active Orders</h3>
                        <p className="stat-number">{stats?.totalOrders || 0}</p>
                        <Link to="/artisan/orders" className="stat-link">View Orders</Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>In Stock</h3>
                        <p className="stat-number">{stats?.activeProducts || 0}</p>
                        <span className="stat-subtitle">Available products</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <p className="stat-number">{formatCurrency(stats?.totalRevenue)}</p>
                        <span className="stat-subtitle">Lifetime earnings</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <Link to="/artisan/products" className="action-card">
                        <div className="action-icon">📦</div>
                        <div className="action-content">
                            <h3>Manage Products</h3>
                            <p>Add, edit, or remove your woodcraft creations</p>
                        </div>
                    </Link>

                    <Link to="/artisan/products/new" className="action-card">
                        <div className="action-icon">➕</div>
                        <div className="action-content">
                            <h3>Add New Product</h3>
                            <p>Create a new product listing</p>
                        </div>
                    </Link>

                    <Link to="/artisan/orders" className="action-card">
                        <div className="action-icon">🛒</div>
                        <div className="action-content">
                            <h3>View Orders</h3>
                            <p>See orders for your products</p>
                        </div>
                    </Link>

                    {/* 🔥 DODAJ PUBLIC PROFILE U QUICK ACTIONS */}
                    <Link to={`/artisans/${user?.id}`} className="action-card">
                        <div className="action-icon">👁️</div>
                        <div className="action-content">
                            <h3>Public Profile</h3>
                            <p>See how customers view your profile</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="section">
                <h2>Recent Activity</h2>
                <div className="recent-activity">
                    <p>Your artisan journey starts here! Start by adding your first product.</p>
                    <Link to="/artisan/products/new" className="btn-primary">
                        Add Your First Product
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ArtisanDashboard;