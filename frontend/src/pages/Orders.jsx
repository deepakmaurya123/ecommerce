import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderList } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderList();
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      } catch (err) {
        setError(err?.message || 'Unable to load your orders right now.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page__title">My Orders</h1>
          <div className="state-wrapper">
            <span className="icon">🔒</span>
            <h3>Login Required</h3>
            <p>Please log in to view your order history.</p>
            <Link to="/login" className="btn-primary" style={{ marginTop: 16 }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page__title">My Orders</h1>
        <p className="page__subtitle">Track your purchases and the items in every order.</p>

        {loading && (
          <div className="state-wrapper">
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-box" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state-wrapper">
            <span className="icon">📦</span>
            <h3>No orders yet</h3>
            <p>You have not placed any orders yet. Start shopping to see them here.</p>
            <Link to="/" className="btn-primary" style={{ marginTop: 16 }}>
              Explore Products
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card__header">
                  <div>
                    <p className="order-card__label">Order #{order.id}</p>
                    <h3 className="order-card__title">Placed on {formatDate(order.created_at)}</h3>
                  </div>
                  <div className="order-card__total">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</div>
                </div>

                <div className="order-card__body">
                  <div className="order-card__items">
                    {order.items?.map((item, idx) => (
                      <div key={`${order.id}-${idx}`} className="order-item-row">
                        <div>
                          <p className="order-item__name">{item.product}</p>
                          <p className="order-item__meta">Qty: {item.quantity}</p>
                        </div>
                        <div className="order-item__price">₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
