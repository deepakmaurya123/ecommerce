import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  deleteCartItem as apiDeleteCartItem,
  normalizeCartItems,
} from '../api/client';

const CartContext = createContext();

const isLoggedIn = () => !!localStorage.getItem('access_token');

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartItems([]);
      setCartError(null);
      return;
    }

    try {
      setLoading(true);
      setCartError(null);
      const data = await getCart();
      setCartItems(normalizeCartItems(data));
    } catch (err) {
      setCartItems([]);
      setCartError(err?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItemToCart = async (product) => {
    if (!isLoggedIn()) {
      setCartError('Please log in to add items to your cart.');
      return { requiresLogin: true };
    }

    try {
      setCartError(null);
      await apiAddToCart(product.id);
      await refreshCart();
      return { success: true };
    } catch (err) {
      const msg = err?.data?.error || err?.message || 'Failed to add item';
      setCartError(msg);
      throw err;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (!isLoggedIn()) {
      setCartError('Please log in to manage your cart.');
      return;
    }

    if (newQuantity < 1) {
      return removeItem(itemId);
    }

    try {
      setCartError(null);
      await apiUpdateCartQuantity(itemId, newQuantity);
      await refreshCart();
    } catch (err) {
      setCartError(err?.message || 'Failed to update quantity');
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    if (!isLoggedIn()) {
      setCartError('Please log in to manage your cart.');
      return;
    }

    try {
      setCartError(null);
      await apiDeleteCartItem(itemId);
      await refreshCart();
    } catch (err) {
      setCartError(err?.message || 'Failed to remove item');
      throw err;
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartError(null);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        totalPrice,
        loading,
        cartError,
        addItemToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCartFromBackend: refreshCart,
        isAuthenticated: isLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
