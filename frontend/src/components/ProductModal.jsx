import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* Toast states */
const IDLE = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR = 'error';

export default function ProductModal({ product, onClose }) {
  const overlayRef = useRef(null);
  const { addItemToCart } = useCart();
  const [toast, setToast] = useState(IDLE);
  const [toastMsg, setToastMsg] = useState('');

  /* lock body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* click outside overlay to close */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleAddToCart = async () => {
    setToast(LOADING);
    try {
      await addItemToCart(product);
      setToast(SUCCESS);
      setToastMsg('Added to cart!');
    } catch {
      setToast(ERROR);
      setToastMsg('Failed to add to cart.');
    } finally {
      setTimeout(() => setToast(IDLE), 2500);
    }
  };

  const imageUrl = product.image ? `${BACKEND_URL}${product.image}` : null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="modal">
        {/* Close button */}
        <button className="modal__close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Image */}
        <div className="modal__image-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} />
          ) : (
            <div className="modal__placeholder">🛍️</div>
          )}
        </div>

        {/* Details */}
        <div className="modal__body">
          {product.category?.name && (
            <span className="modal__category">{product.category.name}</span>
          )}
          <h2 className="modal__title">{product.name}</h2>
          <p className="modal__price">₹{Number(product.price).toLocaleString('en-IN')}</p>

          {product.description && <p className="modal__description">{product.description}</p>}

          {/* Add to Cart button */}
          <button
            id={`add-to-cart-${product.id}`}
            className={`btn-cart ${toast === LOADING ? 'btn-cart--loading' : ''} ${
              toast === SUCCESS ? 'btn-cart--success' : ''
            } ${toast === ERROR ? 'btn-cart--error' : ''}`}
            onClick={handleAddToCart}
            disabled={toast === LOADING}
          >
            {toast === LOADING && <span className="btn-spinner" />}
            {toast === SUCCESS && '✓ '}
            {toast === IDLE && '🛒 '}
            {toast === ERROR && '⚠ '}
            {toast === LOADING
              ? 'Adding…'
              : toast === SUCCESS
              ? 'Added to Cart'
              : toast === ERROR
              ? toastMsg
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
