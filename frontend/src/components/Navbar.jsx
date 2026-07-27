import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalCount } = useCart();

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
        </ul>
      </div>
    </nav>
  );
}
