// context/CartContext.jsx 
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { productAPI } from '../services/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                // Ako item već postoji, povećaj quantity
                const updatedItems = state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );

                const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return { ...state, items: updatedItems, total };
            } else {
                // Ako je novi item, dodaj sa quantity 1
                const newItem = { ...action.payload, quantity: 1 };
                const updatedItems = [...state.items, newItem];
                const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return { ...state, items: updatedItems, total };
            }

        case 'REMOVE_ITEM':
            const filteredItems = state.items.filter(item => item.id !== action.payload);
            const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return { ...state, items: filteredItems, total: newTotal };

        case 'UPDATE_QUANTITY':
            const itemsWithUpdatedQuantity = state.items.map(item =>
                item.id === action.payload.productId
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            ).filter(item => item.quantity > 0);

            const updatedTotal = itemsWithUpdatedQuantity.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return { ...state, items: itemsWithUpdatedQuantity, total: updatedTotal };

        case 'CLEAR_CART':
            return { ...state, items: [], total: 0 };

        case 'LOAD_CART':
            return { ...state, ...action.payload };

        default:
            return state;
    }
};

const initialState = {
    items: [],
    total: 0
};

export const CartProvider = ({ children }) => {
    const [cartState, dispatch] = useReducer(cartReducer, initialState);

    useEffect(() => {
        const savedCart = localStorage.getItem('luxuryWoodCart');
        if (savedCart) {
            dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('luxuryWoodCart', JSON.stringify(cartState));
    }, [cartState]);

    // FUNKCIJA ZA PROVERU STOCK-A
    const checkCartItemStock = async (productId, quantity) => {
        try {
            const product = await productAPI.getProduct(productId);
            return product.stock >= quantity;
        } catch (error) {
            console.error('Error checking stock:', error);
            return false;
        }
    };

    // VALIDACIJA CELOG CART-A
    const validateCartStock = async (cartItems) => {
        try {
            for (const item of cartItems) {
                const hasStock = await checkCartItemStock(item.id, item.quantity);
                if (!hasStock) {
                    const product = await productAPI.getProduct(item.id);
                    return {
                        valid: false,
                        error: `Not enough stock for ${item.name}. Available: ${product.stock}`
                    };
                }
            }
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: 'Error validating stock. Please try again.'
            };
        }
    };

    const addItem = async (product) => {
        try {
            // PROVERI STANJE PRE DODAVANJA U KORPU
            const currentQuantity = getItemQuantity(product.id);
            const hasStock = await checkCartItemStock(product.id, currentQuantity + 1);

            if (!hasStock) {
                alert(`Sorry, ${product.name} is out of stock!`);
                return false;
            }

            dispatch({ type: 'ADD_ITEM', payload: product });
            return true;

        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert('Error adding item to cart. Please try again.');
            return false;
        }
    };

    const removeItem = (productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            // PROVERI STANJE PRE PROMENE KOLIČINE
            if (quantity > 0) {
                const hasStock = await checkCartItemStock(productId, quantity);
                if (!hasStock) {
                    const product = await productAPI.getProduct(productId);
                    alert(`Cannot update quantity. Only ${product.stock} items available for ${product.name}`);
                    return false;
                }
            }

            dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
            return true;

        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity. Please try again.');
            return false;
        }
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getItemQuantity = (productId) => {
        const item = cartState.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        cartState,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        validateCartStock,
        checkCartItemStock
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};