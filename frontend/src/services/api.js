// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// EKSPORTUJ makeRequest funkciju
export const makeRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 Making request to:', url);

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object' &&
        !(config.body instanceof FormData) &&
        !(config.body instanceof URLSearchParams)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        console.log('📥 Response status:', response.status);

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log('📥 Response data:', data);

        if (!response.ok) {
            let errorMessage = `HTTP Error ${response.status}`;

            if (typeof data === 'object') {
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }

            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Auth endpoints
export const authAPI = {
    async login(credentials) {
        return makeRequest('/api/v1/auth/login', {
            method: 'POST',
            body: {
                email: credentials.email,
                password: credentials.password
            }
        });
    },

    async register(userData) {
        return makeRequest('/api/v1/auth/register', {
            method: 'POST',
            body: {
                email: userData.email,
                password: userData.password,
                full_name: userData.full_name,
                role: userData.user_type || 'customer'
            },
        });
    },

    async getCurrentUser() {
        return makeRequest('/api/v1/auth/me');
    },

    async changePassword(passwordData) {
        return makeRequest('/api/v1/auth/change-password', {
            method: 'POST',
            body: {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            }
        });
    },

    async forgotPassword(email) {
        return makeRequest('/api/v1/auth/forgot-password', {
            method: 'POST',
            body: { email }
        });
    },

    async resetPassword(token, newPassword) {
        return makeRequest('/api/v1/auth/reset-password', {
            method: 'POST',
            body: {
                token,
                new_password: newPassword
            }
        });
    }
};

// Product endpoints
export const productAPI = {
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return makeRequest(`/api/v1/products?${queryString}`);
    },

    async getProduct(id) {
        return makeRequest(`/api/v1/products/${id}`);
    },

    async createProduct(productData) {
        return makeRequest('/api/v1/products', {
            method: 'POST',
            body: productData
        });
    },

    async updateProduct(id, productData) {
        return makeRequest(`/api/v1/products/${id}`, {
            method: 'PUT',
            body: productData
        });
    },

    async deleteProduct(id) {
        return makeRequest(`/api/v1/products/${id}`, {
            method: 'DELETE'
        });
    }
};

// Customer endpoints
export const customerAPI = {
    async getMyOrders() {
        return makeRequest('/api/v1/customer/orders');
    },

    async getMyProfile() {
        return makeRequest('/api/v1/customer/profile');
    },

    async updateProfile(profileData) {
        return makeRequest('/api/v1/customer/profile', {
            method: 'PUT',
            body: profileData
        });
    },

    async getMyAddresses() {
        return makeRequest('/api/v1/customer/addresses');
    },

    async addAddress(addressData) {
        return makeRequest('/api/v1/customer/addresses', {
            method: 'POST',
            body: addressData
        });
    },

    async updateAddress(addressId, addressData) {
        return makeRequest(`/api/v1/customer/addresses/${addressId}`, {
            method: 'PUT',
            body: addressData
        });
    },

    async deleteAddress(addressId) {
        return makeRequest(`/api/v1/customer/addresses/${addressId}`, {
            method: 'DELETE'
        });
    },

    async getWishlist() {
        return makeRequest('/api/v1/customer/wishlist');
    },

    async addToWishlist(productId) {
        return makeRequest('/api/v1/customer/wishlist', {
            method: 'POST',
            body: { product_id: productId }
        });
    },

    async removeFromWishlist(productId) {
        return makeRequest(`/api/v1/customer/wishlist/${productId}`, {
            method: 'DELETE'
        });
    }
};

// Artisan endpoints
export const artisanAPI = {
    async getMyProfile() {
        return makeRequest('/api/v1/artisan/profile');
    },

    async getMyProducts() {
        return makeRequest('/api/v1/artisan/products');
    },

    async createProduct(productData) {
        return makeRequest('/api/v1/artisan/products', {
            method: 'POST',
            body: productData
        });
    },

    async updateProduct(productId, productData) {
        return makeRequest(`/api/v1/artisan/products/${productId}`, {
            method: 'PUT',
            body: productData
        });
    },

    async deleteProduct(productId) {
        return makeRequest(`/api/v1/artisan/products/${productId}`, {
            method: 'DELETE'
        });
    },

    async getMyOrders() {
        return makeRequest('/api/v1/artisan/orders');
    },

    async updateOrderStatus(orderId, status) {
        return makeRequest(`/api/v1/artisan/orders/${orderId}`, {
            method: 'PUT',
            body: { status }
        });
    }
};

// Admin endpoints
export const adminAPI = {
    async getDashboardStats() {
        return makeRequest('/api/v1/admin/dashboard');
    },

    async getUsers() {
        return makeRequest('/api/v1/admin/users');
    },

    async createUser(userData) {
        return makeRequest('/api/v1/admin/users', {
            method: 'POST',
            body: userData
        });
    },

    async updateUser(userId, userData) {
        return makeRequest(`/api/v1/admin/users/${userId}`, {
            method: 'PUT',
            body: userData
        });
    },

    async deleteUser(userId) {
        return makeRequest(`/api/v1/admin/users/${userId}`, {
            method: 'DELETE'
        });
    },

    async getProducts() {
        return makeRequest('/api/v1/admin/products');
    },

    async getOrders() {
        return makeRequest('/api/v1/admin/orders');
    },

    async updateOrderStatus(orderId, status) {
        return makeRequest(`/api/v1/admin/orders/${orderId}`, {
            method: 'PUT',
            body: { status }
        });
    },

    async getCustomOrders() {
        return makeRequest('/api/v1/admin/custom-orders');
    },

    async updateCustomOrderStatus(orderId, status) {
        return makeRequest(`/api/v1/admin/custom-orders/${orderId}`, {
            method: 'PUT',
            body: { status }
        });
    }
};

// Order & Checkout endpoints
export const orderAPI = {
    async createOrder(orderData) {
        return makeRequest('/api/v1/orders', {
            method: 'POST',
            body: orderData
        });
    },

    async getOrder(orderId) {
        return makeRequest(`/api/v1/orders/${orderId}`);
    },

    async getOrderConfirmation(orderId) {
        return makeRequest(`/api/v1/orders/${orderId}/confirmation`);
    },

    async cancelOrder(orderId) {
        return makeRequest(`/api/v1/orders/${orderId}/cancel`, {
            method: 'POST'
        });
    },

    async trackOrder(orderId) {
        return makeRequest(`/api/v1/orders/${orderId}/track`);
    }
};

// Payment endpoints
export const paymentAPI = {
    async createPaymentIntent(orderData) {
        return makeRequest('/api/v1/payments/create-intent', {
            method: 'POST',
            body: orderData
        });
    },

    async confirmPayment(paymentIntentId) {
        return makeRequest('/api/v1/payments/confirm', {
            method: 'POST',
            body: { payment_intent_id: paymentIntentId }
        });
    }
};

// Public endpoints (no auth required)
export const publicAPI = {
    async getArtisans() {
        return makeRequest('/api/v1/artisan/public');
    },

    async getArtisanProfile(artisanId) {
        return makeRequest(`/api/v1/artisan/public/${artisanId}`);
    },

    async getArtisanProducts(artisanId) {
        return makeRequest(`/api/v1/artisan/public/${artisanId}/products`);
    }
};

// Cart endpoints (local storage based, but can sync with backend)
export const cartAPI = {
    async syncCart(cartItems) {
        return makeRequest('/api/v1/cart/sync', {
            method: 'POST',
            body: { items: cartItems }
        });
    },

    async getCart() {
        return makeRequest('/api/v1/cart');
    },

    async clearCart() {
        return makeRequest('/api/v1/cart', {
            method: 'DELETE'
        });
    }
};

// Utility functions
export const apiUtils = {
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        return makeRequest('/api/v1/upload', {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
            },
            body: formData
        });
    },

    async searchProducts(query, filters = {}) {
        const params = new URLSearchParams({ q: query, ...filters });
        return makeRequest(`/api/v1/search/products?${params}`);
    }
};

// Direct exports for commonly used functions
export const getProducts = productAPI.getProducts;
export const getProduct = productAPI.getProduct;
export const login = authAPI.login;
export const register = authAPI.register;
export const getCurrentUser = authAPI.getCurrentUser;
export const changePassword = authAPI.changePassword;

// Default export
export default makeRequest;