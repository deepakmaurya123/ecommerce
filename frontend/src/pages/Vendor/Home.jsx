import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import VendorNavbar from '../../components/Vendor/VendorNavbar';
import { useAuth } from '../../context/AuthContext';

const sampleProducts = [
  { id: 1, name: 'Aurora Lamp', sku: 'AUR-100', stock: 24, price: 129.99, status: 'In Stock' },
  { id: 2, name: 'Nova Chair', sku: 'NOV-220', stock: 8, price: 89.5, status: 'Low Stock' },
  { id: 3, name: 'Crest Speaker', sku: 'CRE-310', stock: 0, price: 199.0, status: 'Out of Stock' },
  { id: 4, name: 'Vista Table', sku: 'VIS-410', stock: 15, price: 159.75, status: 'In Stock' },
];

const orderSummary = [
  { id: 'ORD-1024', customer: 'Ava Patel', total: '$248.00', status: 'Packed' },
  { id: 'ORD-1031', customer: 'Leo Kim', total: '$89.50', status: 'Pending' },
  { id: 'ORD-1038', customer: 'Sara Yusuf', total: '$320.00', status: 'Delivered' },
];

export default function VendorHome() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const totalStock = sampleProducts.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = sampleProducts.filter((product) => product.stock > 0 && product.stock <= 10).length;
    const outOfStock = sampleProducts.filter((product) => product.stock === 0).length;
    const revenue = sampleProducts.reduce((sum, product) => sum + product.price * 12, 0);

    return [
      { label: 'Inventory Items', value: sampleProducts.length, icon: '📦' },
      { label: 'Total Stock', value: totalStock, icon: '📊' },
      { label: 'Low Stock', value: lowStock, icon: '⚠️' },
      { label: 'Revenue Estimate', value: `$${revenue.toFixed(0)}`, icon: '💰' },
    ];
  }, []);

  if (!user) {
    return (
      <div className="vendor-app-layout">
        <VendorNavbar />

        <main className="container vendor-page">
          <section className="vendor-header">
            <div>
              <span className="vendor-badge">Vendor Dashboard</span>
              <h1 className="vendor-title">Please sign in to view your vendor workspace.</h1>
              <p className="vendor-subtitle">
                Access your inventory, stock alerts, and recent orders after logging in to the vendor portal.
              </p>
            </div>
            <Link to="/vendor/login" className="vendor-btn-add">Login to Continue</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="vendor-app-layout">
      <VendorNavbar />

      <main className="container vendor-page">
        <section className="vendor-header">
          <div>
            <span className="vendor-badge">Vendor Dashboard</span>
            <h1 className="vendor-title">Manage your company catalog with a clear view of stock and revenue.</h1>
            <p className="vendor-subtitle">
              Keep every product visible, track stock levels, and stay on top of incoming orders from a single workspace.
            </p>
          </div>
          <button type="button" className="vendor-btn-add">＋ Add Product</button>
        </section>

        <section className="vendor-stats-grid" aria-label="Vendor stats">
          {stats.map((stat) => (
            <article key={stat.label} className="vendor-stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="vendor-content-grid">
          <article id="inventory" className="vendor-card">
            <div className="vendor-card-header">
              <h2>Company Products</h2>
              <span className="count-badge">{sampleProducts.length} products</span>
            </div>

            <div className="vendor-table-wrapper">
              <table className="vendor-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="product-cell">{product.name}</td>
                      <td>{product.sku}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`status-pill ${product.stock === 0 ? 'status-pending' : product.stock <= 10 ? 'status-shipped' : 'status-active'}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article id="insights" className="vendor-card">
            <div className="vendor-card-header">
              <h2>Recent Orders</h2>
              <span className="count-badge">Live</span>
            </div>

            <div className="vendor-orders-list">
              {orderSummary.map((order) => (
                <div key={order.id} className="vendor-order-item">
                  <div className="order-main">
                    <span className="order-id">{order.id}</span>
                    <span className="order-date">{order.customer}</span>
                  </div>
                  <div className="order-details">
                    <span className="order-price">{order.total}</span>
                    <span className={`status-pill ${order.status === 'Pending' ? 'status-pending' : order.status === 'Packed' ? 'status-shipped' : 'status-active'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
