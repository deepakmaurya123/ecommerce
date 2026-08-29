export const saveTokens = (data, role = 'customer') => {
  if (!data) return;
  const isVendor = role === 'vendor';
  const accessKey = isVendor ? 'vendor_access_token' : 'customer_access_token';
  const refreshKey = isVendor ? 'vendor_refresh_token' : 'customer_refresh_token';
  const userKey = isVendor ? 'vendor_user' : 'customer_user';

  if (data.access) {
    localStorage.setItem(accessKey, data.access);
    localStorage.setItem('access_token', data.access);
  }
  if (data.refresh) {
    localStorage.setItem(refreshKey, data.refresh);
    localStorage.setItem('refresh_token', data.refresh);
  }
  if (data.user) {
    localStorage.setItem(userKey, JSON.stringify(data.user));
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  localStorage.setItem('auth_role', role);
};

export const getAccessToken = () => {
  const role = localStorage.getItem('auth_role');
  return role === 'vendor'
    ? localStorage.getItem('vendor_access_token') || localStorage.getItem('access_token')
    : localStorage.getItem('customer_access_token') || localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  const role = localStorage.getItem('auth_role');
  return role === 'vendor'
    ? localStorage.getItem('vendor_refresh_token') || localStorage.getItem('refresh_token')
    : localStorage.getItem('customer_refresh_token') || localStorage.getItem('refresh_token');
};

export const removeTokens = (role = null) => {
  const activeRole = role || localStorage.getItem('auth_role');
  const isVendor = activeRole === 'vendor';
  const accessKey = isVendor ? 'vendor_access_token' : 'customer_access_token';
  const refreshKey = isVendor ? 'vendor_refresh_token' : 'customer_refresh_token';
  const userKey = isVendor ? 'vendor_user' : 'customer_user';

  localStorage.removeItem(accessKey);
  localStorage.removeItem(refreshKey);
  localStorage.removeItem(userKey);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth_role');
};

export const getUser = () => {
  const role = localStorage.getItem('auth_role');
  const userKey = role === 'vendor' ? 'vendor_user' : 'customer_user';
  const user = localStorage.getItem(userKey);
  return user ? JSON.parse(user) : null;
};
