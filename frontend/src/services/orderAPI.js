// services/orderAPI.js
import makeRequest from './api';

export const orderAPI = {
    async createCheckoutSession(orderData) {
        return makeRequest('/api/v1/create-checkout-session', {
            method: 'POST',
            body: orderData
        });
    },

    async getOrder(orderId) {
        return makeRequest(`/api/v1/orders/${orderId}`);
    },

    async getOrders() {
        return makeRequest('/api/v1/orders');
    },

    async getOrderBySession(sessionId) {
        return makeRequest(`/api/v1/orders/session/${sessionId}`);
    }
};