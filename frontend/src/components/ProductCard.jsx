const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const PLACEHOLDERS = ['🖥️', '👗', '📱', '👟', '🎮', '📚', '🎧', '⌚', '🏠', '🛒'];

function getPlaceholder(name = '') {
  const idx = name.charCodeAt(0) % PLACEHOLDERS.length;
  return PLACEHOLDERS[idx];
}

export default function ProductCard({ product, onClick }) {
  const imageUrl = product.image
    ? `${BACKEND_URL}${product.image}`
    : null;

  return (
    <article
      className="product-card"
      tabIndex={0}
      aria-label={product.name}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-card__image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" role="img" aria-label="No image">
            {getPlaceholder(product.name)}
          </div>
        )}
      </div>
      <div className="product-card__body">
        {product.category?.name && (
          <p className="product-card__category">{product.category.name}</p>
        )}
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">₹{Number(product.price).toLocaleString('en-IN')}</p>
      </div>
    </article>
  );
}
