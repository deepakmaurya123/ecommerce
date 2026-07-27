import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo">
          ◈ <span>ShopNest</span>
        </NavLink>
        <ul className="navbar__nav">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
              Categories
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
