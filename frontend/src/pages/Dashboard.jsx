// pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ArtisanDashboard from './artisan/ArtisanDashboard';
import AdminDashboard from './admin/AdminDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading">
                    <h2>Loading...</h2>
                    <p>Please wait while we load your dashboard</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="dashboard-page">
                <div className="error">
                    <h2>Access Denied</h2>
                    <p>Please log in to view your dashboard</p>
                </div>
            </div>
        );
    }

    //  RENDERUJ PRAVI DASHBOARD NA OSNOVU ROLE
    console.log(' Current user role:', user.role);

    switch (user.role) {
        case 'artisan':
            return <ArtisanDashboard />;
        case 'admin':
            return <AdminDashboard />;
        case 'customer':
        default:
            return <CustomerDashboard />;
    }
};

export default Dashboard;