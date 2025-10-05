// pages/artisan/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { artisanService } from '../../services/artisanService';
import './Artisan.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await artisanService.getMyProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            await artisanService.createProduct(productData);
            fetchProducts();
            setShowForm(false);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        }
    };

    const handleUpdateProduct = async (productId, productData) => {
        try {
            await artisanService.updateMyProduct(productId, productData);
            fetchProducts();
            setShowForm(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await artisanService.deleteMyProduct(productId);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
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
            <div className="artisan-container">
                <div className="artisan-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="artisan-container">
                <div className="artisan-error">
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
        <div className="artisan-container">
            <div className="page-header">
                <div>
                    <h1>My Products</h1>
                    <p>Manage your woodcraft creations ({products.length} total)</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    + Add New Product
                </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onSubmit={editingProduct ?
                        (data) => handleUpdateProduct(editingProduct.id, data) :
                        handleCreateProduct
                    }
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                />
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No Products Yet</h3>
                    <p>Start by adding your first woodcraft creation to the store.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="product-image">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} />
                                ) : (
                                    <div className="image-placeholder">🪵</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-price">{formatCurrency(product.price)}</p>
                                <p className="product-stock">Stock: {product.stock}</p>
                                <p className="product-category">{product.category} • {product.material}</p>
                            </div>
                            <div className="product-actions">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setShowForm(true);
                                    }}
                                    className="btn-edit"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Product Form Component
const ProductForm = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock || 0,
        category: product?.category || '',
        material: product?.material || '',
        dimensions: product?.dimensions || '',
        is_customizable: product?.is_customizable || false,
        image_url: product?.image_url || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price ($) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock Quantity *</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="chair">Chair</option>
                                <option value="table">Table</option>
                                <option value="bed">Bed</option>
                                <option value="wardrobe">Wardrobe</option>
                                <option value="shelf">Shelf</option>
                                <option value="desk">Desk</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Material</label>
                            <select
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                            >
                                <option value="">Select Material</option>
                                <option value="oak">Oak</option>
                                <option value="beech">Beech</option>
                                <option value="walnut">Walnut</option>
                                <option value="mahogany">Mahogany</option>
                                <option value="maple">Maple</option>
                                <option value="cherry">Cherry</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Dimensions</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="e.g., 100x50x80 cm"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe your product..."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Image URL</label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_customizable"
                                    checked={formData.is_customizable}
                                    onChange={handleChange}
                                />
                                Customizable
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductManagement;