// pages/artisan/Profile.jsx
import React, { useState, useEffect } from 'react';
import { artisanService } from '../../services/artisanService';
import './Artisan.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await artisanService.getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
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
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="artisan-container">
                <div className="artisan-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="artisan-container">
                <div className="artisan-error">
                    <h3>Error Loading Profile</h3>
                    <p>{error}</p>
                    <button onClick={fetchProfile} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="artisan-container">
            <div className="page-header">
                <h1>My Profile</h1>
                <p>Your artisan profile and statistics</p>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile?.artisan?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="profile-info">
                            <h2>{profile?.artisan?.full_name}</h2>
                            <p className="profile-email">{profile?.artisan?.email}</p>
                            <p className="profile-joined">
                                Artisan since {formatDate(profile?.artisan?.joined_date)}
                            </p>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <h3>Your Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-value">{profile?.stats?.total_products || 0}</div>
                                <div className="stat-label">Products</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{profile?.stats?.total_orders || 0}</div>
                                <div className="stat-label">Orders</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{formatCurrency(profile?.stats?.total_revenue)}</div>
                                <div className="stat-label">Revenue</div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-primary" disabled>
                            Edit Profile (Coming Soon)
                        </button>
                        <p className="action-note">
                            Profile editing features will be available in the next update.
                        </p>
                    </div>
                </div>

                <div className="profile-tips">
                    <h3>Artisan Tips</h3>
                    <div className="tips-list">
                        <div className="tip-item">
                            <strong>High-quality images</strong>
                            <p>Use clear, well-lit photos of your products from multiple angles.</p>
                        </div>
                        <div className="tip-item">
                            <strong>Detailed descriptions</strong>
                            <p>Include materials, dimensions, and care instructions.</p>
                        </div>
                        <div className="tip-item">
                            <strong>Manage stock</strong>
                            <p>Keep your inventory updated to avoid overselling.</p>
                        </div>
                        <div className="tip-item">
                            <strong>Prompt communication</strong>
                            <p>Respond quickly to customer inquiries and orders.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;