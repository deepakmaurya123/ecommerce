import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateCartQuantity, deleteCartItem as apiDeleteCartItem } from '../api/client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem('shopnest_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('shopnest_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to local storage', err);
    }
  }, [cartItems]);

  // Fetch cart from backend on mount
  const fetchCartFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCart();
      if (data && Array.isArray(data.items)) {
        const formatted = data.items.map((item) => ({
          id: item.id,
          productId: item.product,
          name: item.product_name,
          price: parseFloat(item.product_price),
          image: item.product_image,
          quantity: item.quantity,
        }));
        setCartItems(formatted);
      }
    } catch {
      // Backend cart fetch failed or unauthenticated: keep local cart
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartFromBackend();
  }, [fetchCartFromBackend]);

  // Add item to cart (Calls backend API & updates state)
  const addItemToCart = async (product) => {
    let apiSuccess = false;
    try {
      await apiAddToCart(product.id);
      apiSuccess = true;
      fetchCartFromBackend();
    } catch {
      // Fallback local update if backend fails or unauthenticated
    }

    if (!apiSuccess) {
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product.id || item.id === product.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: product.id,
              productId: product.id,
              name: product.name,
              price: parseFloat(product.price),
              image: product.image,
              quantity: 1,
            },
          ];
        }
      });
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeItem(itemId);
    }

    try {
      await apiUpdateCartQuantity(itemId, newQuantity);
    } catch {
      // Fallback local state update
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove item
  const removeItem = async (itemId) => {
    try {
      await apiDeleteCartItem(itemId);
    } catch {
      // Fallback local state update
    }

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shopnest_cart');
  };

  // Computations
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        totalPrice,
        loading,
        addItemToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCartFromBackend,
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
