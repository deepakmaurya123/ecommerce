const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiFetch = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const getCategories = () => apiFetch('/categories/');
export const getProducts = (categorySlug) =>
  apiFetch(categorySlug ? `/products/?category=${categorySlug}` : '/products/');
export const getProduct = (id) => apiFetch(`/products/${id}/`);

export const getCart = async () => {
  const res = await fetch(`${BASE_URL}/cart/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
};

export const addToCart = async (productId) => {
  const res = await fetch(`${BASE_URL}/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error('Add to cart failed'), { status: res.status, data });
  }
  return res.json();
};

export const updateCartQuantity = async (itemId, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/update/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ item_id: itemId, quantity }),
  });
  if (!res.ok) throw new Error('Update quantity failed');
  return res.json();
};

export const deleteCartItem = async (itemId) => {
  const res = await fetch(`${BASE_URL}/cart/delete/${itemId}/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete item failed');
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/order/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error('Checkout failed'), { status: res.status, data });
  }
  return res.json();
};

