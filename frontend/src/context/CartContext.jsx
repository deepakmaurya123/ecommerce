import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  deleteCartItem as apiDeleteCartItem,
} from '../api/client';

const CartContext = createContext();

// Check if a JWT token is stored (user is logged in)
const isLoggedIn = () => !!localStorage.getItem('access_token');

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Parse backend cart response into local item shape
  const parseBackendCart = (data) => {
    if (!data || !Array.isArray(data.items)) return [];
    return data.items.map((item) => ({
      id: item.id,
      productId: item.product,
      name: item.product_name,
      price: parseFloat(item.product_price),
      image: item.product_image,
      quantity: item.quantity,
    }));
  };

  // Fetch cart from backend — only if user has a JWT token
  const fetchCartFromBackend = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      setCartError(null);
      const data = await getCart();
      setCartItems(parseBackendCart(data));
    } catch (err) {
      setCartError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartFromBackend();
  }, [fetchCartFromBackend]);

  // Add item — requires login
  const addItemToCart = async (product) => {
    if (!isLoggedIn()) {
      setCartError('Please log in to add items to your cart.');
      return { requiresLogin: true };
    }
    try {
      setCartError(null);
      await apiAddToCart(product.id);
      await fetchCartFromBackend(); // Refresh full cart from backend
    } catch (err) {
      const msg = err?.data?.error || err?.message || 'Failed to add item';
      setCartError(msg);
      throw err;
    }
  };

  // Update quantity — requires login
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
      // Optimistic update in state
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );
    } catch (err) {
      setCartError(err.message || 'Failed to update quantity');
      await fetchCartFromBackend(); // Re-sync on failure
    }
  };

  // Remove item — requires login
  const removeItem = async (itemId) => {
    if (!isLoggedIn()) {
      setCartError('Please log in to manage your cart.');
      return;
    }
    try {
      setCartError(null);
      await apiDeleteCartItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      setCartError(err.message || 'Failed to remove item');
      await fetchCartFromBackend(); // Re-sync on failure
    }
  };

  // Clear cart locally after order is placed
  const clearCart = () => {
    setCartItems([]);
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
        fetchCartFromBackend,
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
