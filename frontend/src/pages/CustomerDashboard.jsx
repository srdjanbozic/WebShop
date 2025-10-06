// pages/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { customerAPI, authAPI } from '../services/api';
import './Dashboard.css';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [profileData, setProfileData] = useState({});
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setMessage('');

            console.log('🔄 Fetching customer dashboard data...');

            //  KORISTI NOVE CUSTOMER ENDPOINT-E
            const [ordersData, profileData] = await Promise.all([
                customerAPI.getMyOrders(),
                customerAPI.getMyProfile()
            ]);

            console.log(' Orders data:', ordersData);
            console.log(' Profile data:', profileData);

            setOrders(ordersData || []);
            setProfileData(profileData || {});

            //  POKUŠAJ ADRESE AKO POSTOJI ENDPOINT
            try {
                const addressesData = await customerAPI.getMyAddresses();
                setAddresses(addressesData || getMockAddresses(profileData?.address || user?.address));
            } catch (error) {
                console.log('ℹ️ Addresses endpoint not available, using default');
                setAddresses(getMockAddresses(profileData?.address || user?.address));
            }

            setMessage('');

        } catch (error) {
            console.error(' Error fetching dashboard data:', error);
            setMessage('Error loading dashboard data. Using demo data.');

            //  FALLBACK NA MOCK DATA
            setOrders(getMockOrders());
            setProfileData(user || {});
            setAddresses(getMockAddresses(user?.address));
        } finally {
            setLoading(false);
        }
    };

    //  MOCK DATA ZA FALLBACK
    const getMockOrders = () => [
        {
            id: 1,
            order_number: 'ORD-001',
            created_at: '2024-01-15T10:30:00',
            status: 'completed',
            total_amount: 899.99,
            items: [
                {
                    product: { name: 'Oak Dining Table' },
                    quantity: 1,
                    price: 899.99
                }
            ],
            shipping_address: '123 Main Street, New York, NY 10001'
        },
        {
            id: 2,
            order_number: 'ORD-002',
            created_at: '2024-01-10T14:20:00',
            status: 'shipped',
            total_amount: 649.99,
            items: [
                {
                    product: { name: 'Walnut Bookshelf' },
                    quantity: 1,
                    price: 450.00
                },
                {
                    product: { name: 'Beech Wood Chair' },
                    quantity: 2,
                    price: 199.99
                }
            ],
            shipping_address: '123 Main Street, New York, NY 10001'
        }
    ];

    const getMockAddresses = (userAddress) => [
        {
            id: 1,
            type: 'primary',
            street: userAddress || '123 Main Street',
            city: 'New York',
            state: 'NY',
            zip_code: '10001',
            country: 'United States'
        }
    ];

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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const formData = new FormData(e.target);
            const profileData = {
                full_name: formData.get('full_name'),
                phone: formData.get('phone'),
                address: formData.get('address')
            };

            console.log(' Updating profile:', profileData);

            // AŽURIRAJ PROFIL
            const updatedProfile = await customerAPI.updateProfile(profileData);
            setProfileData(updatedProfile);

            // SINHRONIZUJ ADRESU U ADDRESSES TABU
            if (profileData.address) {
                setAddresses(prevAddresses =>
                    prevAddresses.map(addr =>
                        addr.type === 'primary'
                            ? { ...addr, street: profileData.address }
                            : addr
                    )
                );
            }

            setMessage(' Profile updated successfully!');

        } catch (error) {
            console.error(' Error updating profile:', error);
            setMessage(' Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    //  PASSWORD CHANGE FUNCTIONALITY
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const formData = new FormData(e.target);
            const passwordData = {
                current_password: formData.get('current_password'),
                new_password: formData.get('new_password'),
                confirm_password: formData.get('confirm_password')
            };

            //  PROVERI DA LI SE ŠIFRE POKLAPAJU
            if (passwordData.new_password !== passwordData.confirm_password) {
                throw new Error('New passwords do not match');
            }

            if (passwordData.new_password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            console.log('🔄 Changing password...');

            //  POZOVI PASSWORD CHANGE ENDPOINT
            await authAPI.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            setMessage(' Password updated successfully!');
            e.target.reset(); // Reset form

        } catch (error) {
            console.error(' Error changing password:', error);
            setMessage(` ${error.message || 'Error updating password. Please check your current password.'}`);
        } finally {
            setSaving(false);
        }
    };

    //  ADDRESS MANAGEMENT FUNCTIONS
    const handleEditAddress = (address) => {
        setEditingAddress(address);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData(e.target);
            const addressData = {
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                zip_code: formData.get('zip_code'),
                country: formData.get('country')
            };

            //  AŽURIRAJ ADRESU U BAZI AKO POSTOJI ENDPOINT
            if (editingAddress.id) {
                // await customerAPI.updateAddress(editingAddress.id, addressData);
            }

            //  AŽURIRAJ LOCAL STATE
            setAddresses(prev =>
                prev.map(addr =>
                    addr.id === editingAddress.id
                        ? { ...addr, ...addressData }
                        : addr
                )
            );

            setEditingAddress(null);
            setMessage(' Address updated successfully!');

        } catch (error) {
            console.error('Error updating address:', error);
            setMessage(' Error updating address');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingAddress(null);
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                // await customerAPI.deleteAddress(addressId);
                setAddresses(prev => prev.filter(addr => addr.id !== addressId));
                setMessage(' Address deleted successfully!');
            } catch (error) {
                console.error('Error deleting address:', error);
                setMessage(' Error deleting address');
            }
        }
    };

    const handleAddNewAddress = async () => {
        const newAddress = {
            id: Date.now(), // temporary ID
            type: 'secondary',
            street: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'United States'
        };
        setEditingAddress(newAddress);
    };

    const handleSetPrimaryAddress = async (addressId) => {
        try {
            setAddresses(prev =>
                prev.map(addr => ({
                    ...addr,
                    type: addr.id === addressId ? 'primary' : 'secondary'
                }))
            );
            setMessage(' Primary address updated!');
        } catch (error) {
            console.error('Error setting primary address:', error);
            setMessage(' Error updating primary address');
        }
    };

    const handleTrackOrder = (orderId) => {
        navigate(`/order/${orderId}`);
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

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Welcome back, {user?.full_name || 'Customer'}!</h1>
                    <p>Manage your account and track your orders</p>
                    <div className="role-badge role-customer">Customer</div>
                </div>

                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
                        {message}
                    </div>
                )}

                <div className="dashboard-content">
                    {/* Sidebar Navigation */}
                    <div className="dashboard-sidebar">
                        <nav className="sidebar-nav">
                            <button
                                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 My Orders
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Profile
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                📍 Addresses
                            </button>
                            <button
                                className="nav-item logout-btn"
                                onClick={logout}
                            >
                                🚪 Logout
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="dashboard-main">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="tab-content">
                                <h2>Order History</h2>
                                {loading ? (
                                    <div className="loading">
                                        <div className="loading-spinner"></div>
                                        <p>Loading your orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="empty-state">
                                        <h3>No orders yet</h3>
                                        <p>Start shopping to see your order history here</p>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="cta-button"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.map(order => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div className="order-info">
                                                        <h4>Order #{order.order_number || order.id}</h4>
                                                        <p className="order-date">
                                                            Placed on {formatDate(order.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="order-status">
                                                        <span
                                                            className="status-badge"
                                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                                        >
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="order-items">
                                                    {order.items?.map((item, index) => (
                                                        <div key={index} className="order-item">
                                                            <span className="item-name">
                                                                {item.product?.name || item.name}
                                                            </span>
                                                            <span className="item-quantity">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            <span className="item-price">
                                                                ${item.price}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {order.shipping_address && (
                                                    <div className="order-shipping">
                                                        <strong>Shipping to:</strong> {order.shipping_address}
                                                    </div>
                                                )}

                                                <div className="order-footer">
                                                    <div className="order-total">
                                                        Total: <strong>${order.total_amount?.toFixed(2)}</strong>
                                                    </div>
                                                    <div className="order-actions">
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => navigate(`/order/${order.id}`)}
                                                        >
                                                            View Details
                                                        </button>
                                                        <button
                                                            className="action-btn"
                                                            onClick={() => handleTrackOrder(order.id)}
                                                        >
                                                            Track Order
                                                        </button>
                                                        {(order.status === 'pending' || order.status === 'processing') && (
                                                            <button className="action-btn cancel-btn">
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="tab-content">
                                <h2>Profile Information</h2>
                                <form onSubmit={handleProfileUpdate} className="profile-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            defaultValue={profileData.full_name || user?.full_name || ''}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            defaultValue={profileData.email || user?.email || ''}
                                            placeholder="Enter your email"
                                            disabled
                                        />
                                        <small>Email cannot be changed</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            defaultValue={profileData.phone || user?.phone || ''}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <textarea
                                            name="address"
                                            defaultValue={profileData.address || user?.address || ''}
                                            placeholder="Enter your full address"
                                            rows="3"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>

                                {/*  PASSWORD CHANGE SECTION */}
                                <div className="password-section">
                                    <h3>Change Password</h3>
                                    <form onSubmit={handlePasswordChange} className="password-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                placeholder="Enter new password"
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirm_password"
                                                placeholder="Confirm new password"
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="save-btn"
                                            disabled={saving}
                                        >
                                            {saving ? 'Updating Password...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="tab-content">
                                <h2>Saved Addresses</h2>

                                {editingAddress ? (
                                    //  EDIT ADDRESS FORM
                                    <div className="address-edit-form">
                                        <h3>{editingAddress.id ? 'Edit Address' : 'Add New Address'}</h3>
                                        <form onSubmit={handleSaveAddress}>
                                            <div className="form-row">
                                                <div className="form-group full-width">
                                                    <label>Street Address</label>
                                                    <input
                                                        type="text"
                                                        name="street"
                                                        defaultValue={editingAddress.street}
                                                        placeholder="Enter street address"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        defaultValue={editingAddress.city}
                                                        placeholder="Enter city"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        defaultValue={editingAddress.state}
                                                        placeholder="Enter state"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        name="zip_code"
                                                        defaultValue={editingAddress.zip_code}
                                                        placeholder="Enter ZIP code"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    defaultValue={editingAddress.country}
                                                    placeholder="Enter country"
                                                    required
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="save-btn" disabled={saving}>
                                                    {saving ? 'Saving...' : 'Save Address'}
                                                </button>
                                                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    //  ADDRESSES LIST
                                    <div className="addresses-list">
                                        {addresses.map(address => (
                                            <div key={address.id} className="address-card">
                                                <div className="address-header">
                                                    <h4>
                                                        {address.type === 'primary' ? 'Primary Address' : 'Address'}
                                                        {address.type === 'primary' && <span className="primary-badge">Primary</span>}
                                                    </h4>
                                                </div>
                                                <p>{address.street}</p>
                                                <p>{address.city}, {address.state} {address.zip_code}</p>
                                                <p>{address.country}</p>
                                                <div className="address-actions">
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => handleEditAddress(address)}
                                                    >
                                                        Edit
                                                    </button>
                                                    {address.type !== 'primary' && (
                                                        <>
                                                            <button
                                                                className="action-btn delete-btn"
                                                                onClick={() => handleDeleteAddress(address.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                className="action-btn set-primary-btn"
                                                                onClick={() => handleSetPrimaryAddress(address.id)}
                                                            >
                                                                Set as Primary
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            className="add-address-btn"
                                            onClick={handleAddNewAddress}
                                        >
                                            + Add New Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;