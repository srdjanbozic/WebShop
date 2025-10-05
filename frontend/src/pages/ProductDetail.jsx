// pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productAPI, makeRequest } from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem, getItemQuantity } = useCart();

    const [product, setProduct] = useState(null);
    const [artisan, setArtisan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const foundProduct = await productAPI.getProduct(id);

            if (foundProduct) {
                setProduct(foundProduct);

                // 🔥 FETCHUJ ARTISAN PODATKE AKO POSTOJI ARTISAN_ID
                if (foundProduct.artisan_id) {
                    await fetchArtisanData(foundProduct.artisan_id);
                }
            } else {
                setError('Product not found');
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Failed to load product');

            // Fallback na test podatke ako API ne radi
            const testProduct = {
                id: parseInt(id),
                name: "Luxury Wood Furniture",
                description: "Handcrafted luxury furniture made from premium materials with exquisite attention to detail.",
                price: 1299.99,
                stock: 5,
                category: "dining",
                material: "oak",
                dimensions: "180x90x75 cm",
                image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
                artisan_id: 25,
            };
            setProduct(testProduct);

            // 🔥 FETCHUJ ARTISAN I ZA FALLBACK
            if (testProduct.artisan_id) {
                await fetchArtisanData(testProduct.artisan_id);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchArtisanData = async (artisanId) => {
        try {
            const artisanData = await makeRequest(`/api/v1/artisan/public/${artisanId}`);
            setArtisan(artisanData.artisan);
        } catch (artisanError) {
            console.error('Error fetching artisan:', artisanError);
            // 🔥 FALLBACK ARTISAN DATA
            const fallbackArtisans = {
                25: { id: 25, full_name: "Marko Woodcraft", email: "marko@luxurywood.com" },
                26: { id: 26, full_name: "Ana Furniture", email: "ana@luxurywood.com" }
            };
            setArtisan(fallbackArtisans[artisanId] || { full_name: "Artisan" });
        }
    };

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addItem(product);
            }
            alert(`${quantity} ${product.name}(s) added to cart!`);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (product && newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const quantityInCart = product ? getItemQuantity(product.id) : 0;

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="loading">
                    <h2>Loading product...</h2>
                    <p>Please wait while we load the product details</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-page">
                <div className="error">
                    <h2>{error || 'Product not found'}</h2>
                    <p>The product you're looking for doesn't exist or is unavailable.</p>
                    <button onClick={() => navigate('/products')} className="cta-button">
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    // Simuliramo multiple slike - u pravoj app bi bile iz baze
    const productImages = [
        product.image_url,
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop"
    ];

    return (
        <div className="product-detail-page">
            <button onClick={() => navigate('/products')} className="back-button">
                ← Back to Products
            </button>

            <div className="product-detail-container">
                {/* Product Images */}
                <div className="product-images">
                    <div className="main-image">
                        <img
                            src={productImages[selectedImage]}
                            alt={product.name}
                            className="main-product-image"
                        />
                    </div>
                    <div className="image-thumbnails">
                        {productImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${product.name} view ${index + 1}`}
                                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-info">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-price">${product.price}</p>

                    {/* 🔥 ARTISAN INFO SECTION - SADA SA PRAVIM ARTISAN PODACIMA */}
                    {artisan && (
                        <div className="product-artisan-info">
                            <h4>Handcrafted by:</h4>
                            <Link to={`/artisans/${product.artisan_id}`} className="artisan-link-large">
                                <div className="artisan-badge">
                                    <span className="artisan-name">{artisan.full_name}</span>
                                    <span className="view-profile">View Profile →</span>
                                </div>
                            </Link>
                        </div>
                    )}

                    <div className="product-meta">
                        <div className="meta-item">
                            <strong>Category:</strong>
                            <span className="meta-value">{product.category}</span>
                        </div>
                        <div className="meta-item">
                            <strong>Material:</strong>
                            <span className="meta-value">{product.material}</span>
                        </div>
                        <div className="meta-item">
                            <strong>Dimensions:</strong>
                            <span className="meta-value">{product.dimensions}</span>
                        </div>
                        <div className="meta-item">
                            <strong>Availability:</strong>
                            <span className={`availability ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                            </span>
                        </div>
                    </div>

                    <p className="product-description">{product.description}</p>

                    {/* Quantity Selector */}
                    <div className="quantity-selector">
                        <label htmlFor="quantity">Quantity:</label>
                        <div className="quantity-controls">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= product.stock}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>
                        <span className="stock-info">
                            {product.stock} items available
                        </span>
                    </div>

                    {/* Add to Cart */}
                    <div className="product-actions">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`add-to-cart-btn large ${product.stock === 0 ? 'disabled' : ''}`}
                        >
                            {product.stock === 0
                                ? 'Out of Stock'
                                : `Add ${quantity} to Cart - $${(product.price * quantity).toFixed(2)}`
                            }
                        </button>

                        {quantityInCart > 0 && (
                            <div className="in-cart-indicator">
                                ✅ {quantityInCart} of this item currently in your cart
                            </div>
                        )}
                    </div>

                    {/* Shipping Info */}
                    <div className="shipping-info">
                        <div className="shipping-item">
                            <span className="shipping-icon">🚚</span>
                            <span>Free shipping on orders over $500</span>
                        </div>
                        <div className="shipping-item">
                            <span className="shipping-icon">↩️</span>
                            <span>30-day return policy</span>
                        </div>
                        <div className="shipping-item">
                            <span className="shipping-icon">🛡️</span>
                            <span>5-year craftsmanship warranty</span>
                        </div>
                    </div>

                    {/* Product Features */}
                    <div className="product-features">
                        <h3>Product Features</h3>
                        <ul>
                            <li>Handcrafted by skilled artisans</li>
                            <li>Premium {product.material} wood construction</li>
                            <li>Eco-friendly and sustainable materials</li>
                            <li>Expert finishing and detailing</li>
                            <li>Durable and long-lasting design</li>
                            <li>Easy assembly with included instructions</li>
                        </ul>
                    </div>

                    {/* Care Instructions */}
                    <div className="care-instructions">
                        <h3>Care Instructions</h3>
                        <ul>
                            <li>Dust regularly with a soft, dry cloth</li>
                            <li>Avoid direct sunlight and heat sources</li>
                            <li>Use coasters for drinks to prevent water marks</li>
                            <li>Clean spills immediately with a damp cloth</li>
                            <li>Apply wood polish every 6 months for maintenance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;