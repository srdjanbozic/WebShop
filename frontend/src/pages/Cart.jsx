// pages/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartState, updateQuantity, removeItem, clearCart } = useCart();
    const { user } = useAuth();

    const handleProceedToCheckout = () => {
        //  PROVERITE DA LI JE KORISNIK ULOGOVAN
        if (!user) {
            // Preusmeri na login sa return URL-om
            navigate('/login', {
                state: { from: '/checkout' }
            });
            return;
        }

        // Ako je ulogovan, idi na checkout
        navigate('/checkout');
    };

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeItem(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    if (cartState.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some luxury furniture to your cart</p>
                    <button onClick={() => navigate('/products')} className="cta-button">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1>Shopping Cart</h1>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartState.items.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image_url} alt={item.name} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-description">{item.description}</p>
                                    <p className="item-price">${item.price}</p>
                                </div>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        className="quantity-btn"
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        className="quantity-btn"
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-total">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>${cartState.total.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>
                                {cartState.total > 500 ? 'FREE' : '$49.99'}
                                {cartState.total < 500 && (
                                    <small>Add ${(500 - cartState.total).toFixed(2)} for free shipping</small>
                                )}
                            </span>
                        </div>

                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>
                                ${(cartState.total + (cartState.total > 500 ? 0 : 49.99)).toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleProceedToCheckout}
                            className="proceed-btn"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            onClick={clearCart}
                            className="clear-cart-btn"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;