// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addItem } = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const success = await addItem(product);
        if (success) {
            console.log(` ${product.name} added to cart`);
        }
    };

    const isOutOfStock = product.stock === 0;
    const lowStock = product.stock > 0 && product.stock <= 5;

    return (

        <Link to={`/products/${product.id}`} className="product-card-link">
            <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                    {/* STOCK BADGE */}
                    {isOutOfStock && (
                        <div className="stock-badge out-of-stock-badge">Out of Stock</div>
                    )}
                    {lowStock && !isOutOfStock && (
                        <div className="stock-badge low-stock-badge">Low Stock</div>
                    )}
                </div>

                <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price">${product.price}</div>

                    {/* STOCK INDICATOR */}
                    <div className={`stock-indicator ${isOutOfStock ? 'out-of-stock' : lowStock ? 'low-stock' : 'in-stock'}`}>
                        {isOutOfStock ? 'Out of Stock' :
                            lowStock ? `Only ${product.stock} left!` :
                                `${product.stock} in stock`}
                    </div>
                </div>

                <button
                    className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;