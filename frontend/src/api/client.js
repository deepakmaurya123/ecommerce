const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

const readStoredValue = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveAuthSession = (role, data) => {
  const isVendor = role === 'vendor';
  const accessKey = isVendor ? 'vendor_access_token' : 'customer_access_token';
  const refreshKey = isVendor ? 'vendor_refresh_token' : 'customer_refresh_token';
  const userKey = isVendor ? 'vendor_user' : 'customer_user';

  if (data?.access) {
    localStorage.setItem(accessKey, data.access);
    localStorage.setItem('access_token', data.access);
  }
  if (data?.refresh) {
    localStorage.setItem(refreshKey, data.refresh);
    localStorage.setItem('refresh_token', data.refresh);
  }
  if (data?.user) {
    localStorage.setItem(userKey, JSON.stringify(data.user));
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  localStorage.setItem('auth_role', role);
};

const clearAuthSession = (role) => {
  const isVendor = role === 'vendor';
  const accessKey = isVendor ? 'vendor_access_token' : 'customer_access_token';
  const refreshKey = isVendor ? 'vendor_refresh_token' : 'customer_refresh_token';
  const userKey = isVendor ? 'vendor_user' : 'customer_user';

  localStorage.removeItem(accessKey);
  localStorage.removeItem(refreshKey);
  localStorage.removeItem(userKey);

  if (localStorage.getItem('auth_role') === role) {
    localStorage.removeItem('auth_role');
  }
};

const apiFetch = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

const getAuthHeaders = () => {
  const role = localStorage.getItem('auth_role');
  const token = role === 'vendor'
    ? localStorage.getItem('vendor_access_token') || localStorage.getItem('access_token')
    : localStorage.getItem('customer_access_token') || localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const requestJson = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { ...getAuthHeaders(), ...headers },
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    let message = 'Request failed';
    if (data && typeof data === 'object') {
      if (typeof data.error === 'string') message = data.error;
      else if (typeof data.detail === 'string') message = data.detail;
      else if (typeof data.message === 'string') message = data.message;
      else if (Array.isArray(data) && data.length > 0) message = String(data[0]);
    } else if (typeof data === 'string' && data) {
      message = data;
    }

    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data;
};

export const getCategories = () => apiFetch('/categories/');
export const getProducts = (categorySlug) =>
  apiFetch(categorySlug ? `/products/?category=${categorySlug}` : '/products/');
export const getProduct = (id) => apiFetch(`/products/${id}/`);

export const normalizeCartItems = (cartData) => {
  if (!cartData || !Array.isArray(cartData.items)) return [];

  return cartData.items.map((item) => ({
    id: item.id,
    productId: item.product,
    name: item.product_name || 'Unnamed product',
    price: Number(item.product_price || 0),
    image: item.product_image || null,
    quantity: Number(item.quantity || 0),
  }));
};

export const getCart = async () => requestJson('/cart/');

export const addToCart = async (productId) =>
  requestJson('/cart/add/', {
    method: 'POST',
    body: { product_id: productId },
  });

export const updateCartQuantity = async (itemId, quantity) =>
  requestJson('/cart/update/', {
    method: 'PUT',
    body: { item_id: itemId, quantity },
  });

export const deleteCartItem = async (itemId) =>
  requestJson(`/cart/delete/${itemId}/`, {
    method: 'DELETE',
  });

export const createOrder = async (orderData) =>
  requestJson('/order/create/', {
    method: 'POST',
    body: orderData,
  });

export const getOrderList = async () => requestJson('/order/list/');

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
  saveAuthSession('customer', data);
  return data;
};

export const loginVendor = async (credentials) => {
  const payload = {
    username: credentials.username || credentials.vendorUsername || '',
    password: credentials.password || credentials.vendorPassword || '',
  };

  const res = await fetch(`${BASE_URL}/vendor/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.detail || data.message || 'Vendor login failed';
    throw Object.assign(new Error(errorMsg), { status: res.status, data });
  }
  saveAuthSession('vendor', data);
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

export const logoutUser = async (role = null) => {
  const activeRole = role || localStorage.getItem('auth_role') || 'customer';
  const refreshKey = activeRole === 'vendor' ? 'vendor_refresh_token' : 'customer_refresh_token';
  const refresh = localStorage.getItem(refreshKey);
  const res = await fetch(`${BASE_URL}/logout/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  clearAuthSession(activeRole);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error('Logout failed'), { status: res.status, data });
  return data;
};



