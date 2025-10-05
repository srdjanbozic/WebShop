// pages/admin/UserManagement.jsx - AŽURIRANO
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            console.log('🔄 Fetching users...');
            const data = await adminService.getUsers();
            console.log('👥 Users data received:', data);
            setUsers(data || []);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            setError(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole, currentRole) => {
        // Sprečava dodeljivanje admin role
        if (newRole === 'admin') {
            alert('Cannot assign admin role directly. Admin roles must be assigned manually.');
            return;
        }

        // Sprečava uklanjanje admin role
        if (currentRole === 'admin' && newRole !== 'admin') {
            alert('Cannot remove admin role from users.');
            return;
        }

        try {
            await adminService.updateUserRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            console.error('❌ Error updating user role:', error);
            alert('Failed to update user role');
        }
    };

    const updateUserStatus = async (userId, isActive, userRole) => {
        // Sprečava deaktivaciju admina
        if (userRole === 'admin') {
            alert('Cannot deactivate admin users.');
            return;
        }

        try {
            await adminService.updateUserStatus(userId, isActive);
            fetchUsers();
        } catch (error) {
            console.error('❌ Error updating user status:', error);
            alert('Failed to update user status');
        }
    };

    const deleteUser = async (userId, userRole, userEmail) => {
        // Sprečava brisanje trenutnog korisnika
        if (userEmail === currentUser.email) {
            alert('You cannot delete your own account.');
            return;
        }

        // Sprečava brisanje admina
        if (userRole === 'admin') {
            alert('Cannot delete admin users.');
            return;
        }

        if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) return;

        try {
            await adminService.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="admin-error">
                    <h3>Error Loading Users</h3>
                    <p>{error}</p>
                    <button onClick={fetchUsers} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>User Management</h1>
                <p>Manage all users in the system ({users.length} total)</p>
            </div>

            <div className="table-container">
                {users.length === 0 ? (
                    <div className="no-data">
                        <p>No users found</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={user.role === 'admin' ? 'admin-row' : ''}>
                                    <td>{user.id}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="user-name">{user.full_name}</span>
                                            {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value, user.role)}
                                            className={`role-select ${user.role}`}
                                            disabled={user.role === 'admin'}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="artisan">Artisan</option>
                                            <option value="admin" disabled>Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => updateUserStatus(user.id, !user.is_active, user.role)}
                                            className="btn-status"
                                            disabled={user.role === 'admin'}
                                        >
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                    <td>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => deleteUser(user.id, user.role, user.email)}
                                            className="btn-danger"
                                            disabled={user.role === 'admin' || user.email === currentUser.email}
                                        >
                                            Delete
                                        </button>
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

export default UserManagement;