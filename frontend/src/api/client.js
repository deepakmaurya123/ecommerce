const BASE_URL = import.meta.env.VITE_API_URL;

const apiFetch = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const getCategories = () => apiFetch('/categories/');
export const getProducts = (categorySlug) =>
  apiFetch(categorySlug ? `/products/?category=${categorySlug}` : '/products/');
export const getProduct = (id) => apiFetch(`/products/${id}/`);

export const getCart = async () => {
  const res = await fetch(`${BASE_URL}/cart/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
};

export const addToCart = async (productId) => {
  const res = await fetch(`${BASE_URL}/cart/add/`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ item_id: itemId, quantity }),
  });
  if (!res.ok) throw new Error('Update quantity failed');
  return res.json();
};

export const deleteCartItem = async (itemId) => {
  const res = await fetch(`${BASE_URL}/cart/delete/${itemId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete item failed');
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/order/create/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error('Checkout failed'), { status: res.status, data });
  }
  return res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.detail || 'Login failed';
    throw Object.assign(new Error(errorMsg), { status: res.status, data });
  }
  // backend returns top-level `access`, `refresh`, and `user`
  if (data.access) localStorage.setItem('access_token', data.access);
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let errorMsg = 'Registration failed';
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstErr = data[keys[0]];
        errorMsg = Array.isArray(firstErr) ? firstErr[0] : String(firstErr);
      }
    }
    throw Object.assign(new Error(errorMsg), { status: res.status, data });
  }
  if (data.tokens && data.tokens.access) {
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
  }
  return data;
};

export const logoutUser = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const res = await fetch(`${BASE_URL}/logout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error('Logout failed'), { status: res.status, data });
  return data;
};

export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/user/me/`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
};



