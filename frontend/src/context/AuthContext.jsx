import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, loginVendor, registerUser, logoutUser } from '../api/client';

const AuthContext = createContext();

const readStoredValue = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [customerUser, setCustomerUser] = useState(() => readStoredValue('customer_user'));
  const [vendorUser, setVendorUser] = useState(() => readStoredValue('vendor_user'));
  const [authRole, setAuthRole] = useState(() => {
    const savedRole = localStorage.getItem('auth_role');
    if (savedRole === 'vendor' || savedRole === 'customer') {
      return savedRole;
    }

    const legacyUser = readStoredValue('user');
    return legacyUser?.isVendor ? 'vendor' : legacyUser ? 'customer' : null;
  });
  const [loading, setLoading] = useState(false);

  const user = authRole === 'vendor' ? vendorUser : authRole === 'customer' ? customerUser : null;

  useEffect(() => {
    const savedRole = localStorage.getItem('auth_role');
    if (savedRole === 'vendor') {
      setVendorUser(readStoredValue('vendor_user'));
      setAuthRole('vendor');
    } else if (savedRole === 'customer') {
      setCustomerUser(readStoredValue('customer_user'));
      setAuthRole('customer');
    } else {
      setCustomerUser(readStoredValue('customer_user'));
      setVendorUser(readStoredValue('vendor_user'));
      setAuthRole(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    if (data.user) {
      setCustomerUser(data.user);
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      setAuthRole('customer');
      localStorage.setItem('auth_role', 'customer');
    }
    return data;
  };

  const vendorLogin = async (credentials) => {
    const data = await loginVendor(credentials);
    if (data.user) {
      setVendorUser(data.user);
      localStorage.setItem('vendor_user', JSON.stringify(data.user));
      setAuthRole('vendor');
      localStorage.setItem('auth_role', 'vendor');
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser(authRole);
    } catch (err) {
      console.warn('Logout API failed, clearing local state', err);
    }

    if (authRole === 'customer') {
      setCustomerUser(null);
      localStorage.removeItem('customer_user');
    } else if (authRole === 'vendor') {
      setVendorUser(null);
      localStorage.removeItem('vendor_user');
    }

    setAuthRole(null);
    localStorage.removeItem('auth_role');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, authRole, login, vendorLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
