import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getProducts } from '../api/client';
import ProductCard from '../components/ProductCard';
import SkeletonGrid from '../components/SkeletonGrid';
import ProductModal from '../components/ProductModal';


export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, []);

  // Fetch products when active category changes
  useEffect(() => {
    setLoadingProducts(true);
    setError(null);
    const slug = activeCategory === 'all' ? null : activeCategory;
    getProducts(slug)
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, [activeCategory]);

  const featuredProducts = products.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero__badge">✦ New arrivals every week</div>
          <h1 className="hero__title">
            Discover <span>Premium</span> Products
          </h1>
          <p className="hero__subtitle">
            Explore our curated collection of the finest products across all categories.
          </p>

          {/* Category chips */}
          {(
            <div className="category-chips" style={{ justifyContent: 'center' }}>
              <button
                className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`chip ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory === 'all'
                ? 'All Products'
                : categories.find((c) => c.slug === activeCategory)?.name ?? 'Products'}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem', marginLeft: 10 }}>
                {!loadingProducts && `${products.length} items`}
              </span>
            </h2>
            {products.length > 0 && (
              <span
                className="section-link"
                onClick={() => navigate('/categories')}
                style={{ cursor: 'pointer' }}
              >
                Browse all →
              </span>
            )}
          </div>

          {loadingProducts ? (
            <SkeletonGrid count={8} />
          ) : error ? (
            <div className="state-wrapper">
              <span className="icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="state-wrapper">
              <span className="icon">📦</span>
              <p>No products found in this category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
