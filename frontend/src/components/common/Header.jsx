// components/common/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartIcon from './CartIcon';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/dashboard';

        switch (user.role) {
            case 'artisan':
                return '/artisan/dashboard';
            case 'admin':
                return '/admin/dashboard';
            default:
                return '/dashboard';
        }
    };

    const getRoleDisplayName = () => {
        switch (user?.role) {
            case 'artisan': return 'Artisan';
            case 'admin': return 'Admin';
            case 'customer': return 'Customer';
            default: return 'User';
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* LEVA STRANA - LOGO */}
                <Link to="/" className="logo">
                    🪵 Luxury Wood Furniture
                </Link>

                {/* CENTAR - NAVIGACIJA */}
                <nav className="nav">
                    <div className="nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>

                        {/* ROLE-SPECIFIC LINKS */}
                        {user && user.role === 'artisan' && (
                            <Link to="/artisan/dashboard" className="role-link">My Workshop</Link>
                        )}
                        {user && user.role === 'admin' && (
                            <Link to="/admin/dashboard" className="role-link">Admin Panel</Link>
                        )}
                    </div>
                </nav>

                {/* DESNA STRANA - USER/AUTH + CART */}
                <div className="user-section">
                    {user ? (
                        <>
                            {/* DASHBOARD LINK - ZAVISI OD ULOGE */}
                            <Link to={getDashboardLink()} className="dashboard-link">
                                My Account
                            </Link>

                            {/* ROLE BADGE */}
                            <span className={`role-badge role-${user.role}`}>
                                {getRoleDisplayName()}
                            </span>

                            <span className="welcome-text">Welcome, {user.full_name}</span>
                            <button className="logout-btn" onClick={logout}>
                                Logout
                            </button>
                            <CartIcon />
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="auth-link">Login</Link>
                            <Link to="/register" className="auth-link">Register</Link>
                            <CartIcon />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;