// pages/admin/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './Admin.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            console.log(' Fetching products...');
            const data = await adminService.getAllProducts();
            console.log(' Products data received:', data);
            setProducts(data || []);
        } catch (error) {
            console.error(' Error fetching products:', error);
            setError(error.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const updateProductStock = async (productId, newStock) => {
        if (newStock < 0) {
            alert('Stock cannot be negative');
            return;
        }

        try {
            await adminService.updateProductStock(productId, newStock);
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error(' Error updating product stock:', error);
            alert('Failed to update product stock');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="admin-error">
                    <h3>Error Loading Products</h3>
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="btn-retry">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Product Management</h1>
                <p>Manage all products in the store ({products.length} total)</p>
            </div>

            <div className="table-container">
                {products.length === 0 ? (
                    <div className="no-data">
                        <p>No products found</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Material</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Artisan</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <div className="product-info">
                                            <strong>{product.name}</strong>
                                            {product.description && (
                                                <small className="product-description">{product.description}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">{product.category || 'N/A'}</span>
                                    </td>
                                    <td>{product.material || 'N/A'}</td>
                                    <td>
                                        <strong>{formatCurrency(product.price)}</strong>
                                    </td>
                                    <td>
                                        <div className="stock-control">
                                            <input
                                                type="number"
                                                value={product.stock}
                                                onChange={(e) => updateProductStock(product.id, parseInt(e.target.value))}
                                                min="0"
                                                className="stock-input"
                                            />
                                            <span className="stock-label">units</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="artisan-info">
                                            {product.artisan?.full_name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="product-actions">
                                            <button className="btn-edit">Edit</button>
                                            <button className="btn-danger">Delete</button>
                                        </div>
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

export default ProductManagement;