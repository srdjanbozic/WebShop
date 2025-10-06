// services/adminService.js 
import { makeRequest } from './api';

export const adminService = {
    // Dashboard
    getDashboard: () => makeRequest('/api/v1/admin/dashboard'),

    // User Management
    getUsers: () => makeRequest('/api/v1/admin/users'),
    updateUserRole: (userId, role) => makeRequest(`/api/v1/admin/users/${userId}/role`, {
        method: 'PUT',
        body: { role }
    }),
    updateUserStatus: (userId, isActive) => makeRequest(`/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        body: { is_active: isActive }
    }),
    deleteUser: (userId) => makeRequest(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE'
    }),

    // Product Management  
    getAllProducts: () => makeRequest('/api/v1/admin/products'),
    updateProductStock: (productId, stock) => makeRequest(`/api/v1/admin/products/${productId}/stock`, {
        method: 'PUT',
        body: { stock }
    }),

    // Order Management
    getAllOrders: (status = '') => makeRequest(`/api/v1/admin/orders?status=${status}`),
    updateOrderStatus: (orderId, status) => makeRequest(`/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: { status }
    }),

    // Custom Orders
    getAllCustomOrders: () => makeRequest('/api/v1/admin/custom-orders'),
    assignCustomOrder: (orderId, artisanId) => makeRequest(`/api/v1/admin/custom-orders/${orderId}/assign`, {
        method: 'PUT',
        body: { artisan_id: artisanId }
    })
};