import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VendorLogin() {
  const { user, authRole, vendorLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authRole === 'vendor' && user) {
      navigate('/vendor/home');
    }
  }, [authRole, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (!form.username || !form.password) {
        throw new Error('Please enter both vendor username and password');
      }

      await vendorLogin({ username: form.username, password: form.password });
      setMessage('Vendor login successful!');
      setTimeout(() => navigate('/vendor/home'), 800);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Vendor login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Vendor Login</h2>
          <p className="auth-subtitle">Access your company dashboard and products.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Vendor Username</label>
              <input
                name="username"
                onChange={handleChange}
                value={form.username}
                placeholder="Vendor Username"
                required
              />
            </div>

            <div className="form-group">
              <label>Vendor Password</label>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={form.password}
                placeholder="Vendor Password"
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login as Vendor'}
            </button>
          </form>

          {message && (
            <p className={`auth-alert ${message.includes('successful') ? 'auth-alert--success' : 'auth-alert--error'}`}>
              {message}
            </p>
          )}

          <div className="auth-footer">
            Want to use customer login?{' '}
            <Link to="/login" className="auth-link-btn">
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
