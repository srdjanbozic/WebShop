// components/ProductCard.jsx - MODIFIKUJ
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addItem, getItemQuantity } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const quantityInCart = getItemQuantity(product.id);

    return (
        <Link to={`/products/${product.id}`} className="product-card-link">
            <div className="product-card">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                        console.log(`❌ IMAGE FAILED: ${product.image_url}`);
                        e.target.src = '/images/placeholder-furniture.jpg';
                    }}
                />
                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    {/* 🔥 DODAJ ARTISAN LINK OVDE */}
                    <div className="artisan-info">
                        <Link
                            to={`/artisans/${product.artisan_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="artisan-link"
                        >
                            By: {product.artisan?.full_name || 'Artisan'}
                        </Link>
                    </div>

                    <div className="product-details">
                        <span className="product-price">${product.price}</span>
                        <span className="product-stock">{product.stock} in stock</span>
                    </div>
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    {quantityInCart > 0 && (
                        <div className="in-cart-indicator">
                            {quantityInCart} in cart
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;