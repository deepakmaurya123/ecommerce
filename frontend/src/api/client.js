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

export const addToCart = async (productId) => {
  const res = await fetch(`${BASE_URL}/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',          // sends session cookie for auth
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error('Add to cart failed'), { status: res.status, data });
  }
  return res.json();
};
