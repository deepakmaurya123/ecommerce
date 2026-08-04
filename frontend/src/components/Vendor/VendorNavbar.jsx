import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VendorNavbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.assign('/login');
  };

  return (
    <header className="vendor-navbar">
      <div className="container vendor-navbar__inner">
        <div className="vendor-navbar__brand">
          <NavLink to="/vendor/home" className="vendor-navbar__logo">
            ◈ <span>Vendor HQ</span>
          </NavLink>
          <span className="vendor-navbar__tag">Supplier Portal</span>
        </div>

        <nav className="vendor-navbar__nav" aria-label="Vendor navigation">
          <NavLink to="/vendor/home" end className={({ isActive }) => `vendor-nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <a href="#inventory" className="vendor-nav-link">
            Inventory
          </a>
          <a href="#insights" className="vendor-nav-link">
            Insights
          </a>
        </nav>

        <div className="vendor-navbar__actions">
          <div className="vendor-user-profile">
            <span className="vendor-user-avatar">🏪</span>
            <div className="vendor-user-info">
              <span className="vendor-user-name">{user?.username || 'Vendor'}</span>
              <span className="vendor-user-role">{user?.company_name || 'Your company'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
