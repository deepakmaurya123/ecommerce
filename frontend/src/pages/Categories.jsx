import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/client';
import ProductCard from '../components/ProductCard';
import SkeletonGrid from '../components/SkeletonGrid';
import ProductModal from '../components/ProductModal';

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [productCounts, setProductCounts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch categories + counts once
  useEffect(() => {
    getCategories()
      .then(async (cats) => {
        setCategories(cats);
        // Fetch all products once to compute per-category counts
        const all = await getProducts(null);
        const counts = { all: all.length };
        cats.forEach((cat) => {
          counts[cat.slug] = all.filter((p) => p.category?.id === cat.id).length;
        });
        setProductCounts(counts);
      })
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    setLoadingProducts(true);
    setError(null);
    const slug = activeCategory === 'all' ? null : activeCategory;
    getProducts(slug)
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, [activeCategory]);

  const handleSelectCategory = (slug) => {
    setActiveCategory(slug);
    setSearchParams(slug === 'all' ? {} : { cat: slug });
  };

  const activeCategoryName =
    activeCategory === 'all'
      ? 'All Products'
      : categories.find((c) => c.slug === activeCategory)?.name ?? 'Products';

  return (
    <>
    <div className="page">
      <div className="container">
        <h1 className="page__title">Categories</h1>
        <p className="page__subtitle">Browse products by category</p>

        <div className="layout-sidebar">
          {/* Sidebar */}
          <aside className="sidebar" aria-label="Category filter">
            <p className="sidebar__title">All Categories</p>
            <div
              className={`sidebar__item ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleSelectCategory('all')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectCategory('all')}
            >
              <span>All Products</span>
              {productCounts.all !== undefined && (
                <span className="sidebar__count">{productCounts.all}</span>
              )}
            </div>

            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`sidebar__item ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleSelectCategory(cat.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectCategory(cat.slug)}
              >
                <span>{cat.name}</span>
                {productCounts[cat.slug] !== undefined && (
                  <span className="sidebar__count">{productCounts[cat.slug]}</span>
                )}
              </div>
            ))}
          </aside>

          {/* Main Content */}
          <main>
            <div className="section-header">
              <h2 className="section-title">
                {activeCategoryName}
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                    fontSize: '1rem',
                    marginLeft: 10,
                  }}
                >
                  {!loadingProducts && `${products.length} items`}
                </span>
              </h2>
            </div>

            {loadingProducts ? (
              <SkeletonGrid count={6} />
            ) : error ? (
              <div className="state-wrapper">
                <span className="icon">⚠️</span>
                <p>{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="state-wrapper">
                <span className="icon">📦</span>
                <p>No products in this category yet.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
