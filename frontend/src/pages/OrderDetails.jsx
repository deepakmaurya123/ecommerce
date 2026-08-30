import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderDetail } from '../api/client';
import { useAuth } from '../context/AuthContext';
import NestAI from '../components/NestAI';

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

export default function OrderDetails() {
  const { user } = useAuth();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderDetail(orderId);
        setOrder(data?.order || null);
      } catch (err) {
        setError(err?.message || 'Unable to load this order right now.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [user, orderId]);

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page__title">Order Details</h1>
          <div className="state-wrapper">
            <span className="icon">🔒</span>
            <h3>Login Required</h3>
            <p>Please log in to view your order details.</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h1 className="page__title">Order Details</h1>
            <p className="page__subtitle">View the full summary for this order.</p>
          </div>
          <Link to="/orders" className="btn-primary" style={{ textDecoration: 'none' }}>
            Back to Orders
          </Link>
        </div>

        {loading && (
          <div className="state-wrapper">
            <p>Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-box" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {!loading && !error && !order && (
          <div className="state-wrapper">
            <span className="icon">📦</span>
            <h3>Order not found</h3>
            <p>The requested order could not be found.</p>
          </div>
        )}

        {!loading && !error && order && (
          <div className="orders-layout">
            <div className="orders-list">
              <article className="order-card">
                <div className="order-card__header">
                  <div>
                    <p className="order-card__label">Order #{order.id}</p>
                    <h3 className="order-card__title">Placed on {formatDate(order.created_at)}</h3>
                  </div>
                  <div className="order-card__total">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</div>
                </div>

                <div className="order-card__body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
                    <div>
                      <p className="order-item__meta" style={{ margin: 0, textTransform: 'uppercase' }}>Status</p>
                      <strong>{order.status || 'Pending'}</strong>
                    </div>
                    <div>
                      <p className="order-item__meta" style={{ margin: 0, textTransform: 'uppercase' }}>Tracking</p>
                      <strong>{order.tracking_number || '—'}</strong>
                    </div>
                    <div>
                      <p className="order-item__meta" style={{ margin: 0, textTransform: 'uppercase' }}>Delivery</p>
                      <strong>{order.delivery || '—'}</strong>
                    </div>
                  </div>

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
            </div>

            <NestAI orderId={orderId} />
          </div>
        )}
      </div>
    </div>
  );
}
