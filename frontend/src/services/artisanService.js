// services/artisanService.js - ISPRAVI SVE PUTANJE
import { makeRequest } from './api';

export const artisanService = {
    // Products
    getMyProducts: () => makeRequest('/api/v1/artisan/products'),
    createProduct: (productData) => makeRequest('/api/v1/artisan/products', {
        method: 'POST',
        body: productData
    }),
    updateMyProduct: (productId, productData) => makeRequest(`/api/v1/artisan/products/${productId}`, {
        method: 'PUT',
        body: productData
    }),
    deleteMyProduct: (productId) => makeRequest(`/api/v1/artisan/products/${productId}`, {
        method: 'DELETE'
    }),

    // Orders
    getMyOrders: () => makeRequest('/api/v1/artisan/orders'),

    // Profile
    getMyProfile: () => makeRequest('/api/v1/artisan/profile')
};