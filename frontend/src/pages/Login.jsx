import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect target after auth
  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  if (user && !isSubmitting && !success) {
    // Already logged in
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!formData.username.trim() || !formData.password) {
          throw new Error('Please fill in all required fields.');
        }
        await login({
          username: formData.username.trim(),
          password: formData.password,
        });
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      } else {
        // Register mode validation
        if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.password2) {
          throw new Error('Please fill in all registration fields.');
        }
        if (formData.password !== formData.password2) {
          throw new Error('Passwords do not match.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await register({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          password2: formData.password2,
        });
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <span>◈</span> ShopNest
            </div>
            <h1 className="auth-title">
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Sign in to access your orders, cart, and account settings.'
                : 'Join ShopNest today and enjoy effortless shopping & quick checkout.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Customer Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              Register Account
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="auth-alert auth-alert--error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert--success">
              <span className="alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">
                {mode === 'login' ? 'Username or Email' : 'Username'}
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder={mode === 'login' ? 'Enter username or email' : 'Choose a unique username'}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email (Register only) */}
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password2"
                    name="password2"
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner-loader">Processing...</span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="auth-footer">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => handleTabSwitch('register')}
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => handleTabSwitch('login')}
                >
                  Log in here
                </button>
              </p>
            )}
            <div className="auth-back-link">
              <Link to="/">← Return to Store</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
