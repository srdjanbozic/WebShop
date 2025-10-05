// components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false, requireArtisan = false }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // REDIRECT NA LOGIN AKO NIJE ULOGOVAN
                navigate('/login', { state: { from: location } });
                return;
            }

            // ROVERI PERMISIJE
            if (requireAdmin && user.role !== 'admin') {
                navigate('/dashboard');
                return;
            }

            if (requireArtisan && user.role !== 'artisan') {
                navigate('/dashboard');
                return;
            }

            // AUTOMATSKI REDIRECT AKO JE ARTISAN/ADMIN NA OBICAN DASHBOARD
            if (location.pathname === '/dashboard') {
                if (user.role === 'artisan') {
                    navigate('/artisan/dashboard');
                    return;
                } else if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                    return;
                }
            }
        }
    }, [user, loading, navigate, location, requireAdmin, requireArtisan]);

    if (loading) {
        return (
            <div className="loading">
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (!user) {
        return null; // Redirect se već desio
    }

    // PROVERI PERMISIJE PRE RENDEROVANJA
    if (requireAdmin && user.role !== 'admin') {
        return (
            <div className="error">
                <h2>Access Denied</h2>
                <p>Admin permissions required</p>
            </div>
        );
    }

    if (requireArtisan && user.role !== 'artisan') {
        return (
            <div className="error">
                <h2>Access Denied</h2>
                <p>Artisan permissions required</p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;