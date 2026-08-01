import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo">
          ◈ <span>ShopNest</span>
        </NavLink>
        <ul className="navbar__nav">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink to="/cart" className={({ isActive }) => `navbar__cart-link ${isActive ? 'active' : ''}`}>
              <span className="cart-icon">🛒</span>
              <span>Cart</span>
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
              Orders
            </NavLink>
          </li>

          <li>
            {user ? (
              <div className="navbar__user">
                <span className="user-greeting">👤 {user.username}</span>
                <button type="button" onClick={logout} className="navbar__logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `navbar__login-btn ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

