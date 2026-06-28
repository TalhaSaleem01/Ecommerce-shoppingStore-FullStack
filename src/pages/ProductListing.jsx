import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchProducts, fetchCategories, fetchFilterOptions } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'
import './ProductListing.css'

const VISIBLE_LIMIT = 4 
export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filterOptions, setFilterOptions] = useState({ brands: [], features: [] })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const search = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const condition = searchParams.get('condition') || 'any'
  const minRating = searchParams.get('rating') || ''
  const featuredOnly = searchParams.get('featured') === 'true'
  const selectedBrands = useMemo(
    () => (searchParams.get('brands') ? searchParams.get('brands').split(',') : []),
    [searchParams]
  )
  const selectedFeatures = useMemo(
    () => (searchParams.get('features') ? searchParams.get('features').split(',') : []),
    [searchParams]
  )

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data))
    fetchFilterOptions().then(setFilterOptions)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await fetchProducts({
        search,
        categorySlug,
        sort,
        brands: selectedBrands,
        features: selectedFeatures,
        featured: featuredOnly || undefined,
      })
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [search, categorySlug, sort, selectedBrands, selectedFeatures, featuredOnly])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (Number(p.price) > maxPrice) return false
      if (condition === 'in_stock' && p.stock <= 0) return false
      if (condition === 'out_of_stock' && p.stock > 0) return false
      if (minRating && Number(p.rating || 0) < Number(minRating)) return false
      return true
    })
  }, [products, maxPrice, condition, minRating])

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function toggleListParam(key, value, currentList) {
    const next = currentList.includes(value)
      ? currentList.filter((v) => v !== value)
      : [...currentList, value]
    updateParam(key, next.join(','))
  }

  function clearAllFilters() {
    setSearchParams({})
    setMaxPrice(1000)
  }

  async function handleAddToCart(product) {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(product.id, 1)
    showToast(error ? 'Could not add to cart' : `Added "${product.name}" to cart`, error ? 'error' : 'success')
  }

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name
  const breadcrumbLabel = featuredOnly ? 'Hot Offers' : (activeCategoryName || 'All products')
  const hasActiveFilters =
    categorySlug || selectedBrands.length > 0 || selectedFeatures.length > 0 || search ||
    condition !== 'any' || minRating || featuredOnly

  const visibleCategories = showAllCategories ? categories : categories.slice(0, VISIBLE_LIMIT)
  const visibleBrands = showAllBrands ? filterOptions.brands : filterOptions.brands.slice(0, VISIBLE_LIMIT)
  const visibleFeatures = showAllFeatures ? filterOptions.features : filterOptions.features.slice(0, VISIBLE_LIMIT)

  return (
    <div className="container listing">
      <div className="listing__breadcrumb">
        <Link to="/">Home</Link> / <span>{breadcrumbLabel}</span>
        {search && <span> · Results for "{search}"</span>}
      </div>

      <div className="listing__layout">
        <aside className="listing__sidebar">
          <div className="listing__filter-block">
            <h3>Category</h3>
            <ul>
              <li>
                <button
                  className={!categorySlug ? 'is-active' : ''}
                  onClick={() => updateParam('category', '')}
                >
                  All categories
                </button>
              </li>
              {visibleCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={categorySlug === cat.slug ? 'is-active' : ''}
                    onClick={() => updateParam('category', cat.slug)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
            {categories.length > VISIBLE_LIMIT && (
              <button className="listing__see-all" onClick={() => setShowAllCategories((v) => !v)}>
                {showAllCategories ? 'Show less' : 'See all'}
              </button>
            )}
          </div>

          {filterOptions.brands.length > 0 && (
            <div className="listing__filter-block">
              <h3>Brands</h3>
              <ul className="listing__checkbox-list">
                {visibleBrands.map((brand) => (
                  <li key={brand}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleListParam('brands', brand, selectedBrands)}
                      />
                      {brand}
                    </label>
                  </li>
                ))}
              </ul>
              {filterOptions.brands.length > VISIBLE_LIMIT && (
                <button className="listing__see-all" onClick={() => setShowAllBrands((v) => !v)}>
                  {showAllBrands ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
          )}

          {filterOptions.features.length > 0 && (
            <div className="listing__filter-block">
              <h3>Features</h3>
              <ul className="listing__checkbox-list">
                {visibleFeatures.map((feature) => (
                  <li key={feature}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleListParam('features', feature, selectedFeatures)}
                      />
                      {feature}
                    </label>
                  </li>
                ))}
              </ul>
              {filterOptions.features.length > VISIBLE_LIMIT && (
                <button className="listing__see-all" onClick={() => setShowAllFeatures((v) => !v)}>
                  {showAllFeatures ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
          )}

          <div className="listing__filter-block">
            <h3>Price range</h3>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="listing__price-readout">Up to ${maxPrice}</div>
          </div>

          <div className="listing__filter-block">
            <h3>Condition</h3>
            <ul className="listing__radio-list">
              {[
                { value: 'any', label: 'Any' },
                { value: 'in_stock', label: 'In stock' },
                { value: 'out_of_stock', label: 'Out of stock' },
              ].map((opt) => (
                <li key={opt.value}>
                  <label>
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === opt.value}
                      onChange={() => updateParam('condition', opt.value === 'any' ? '' : opt.value)}
                    />
                    {opt.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="listing__filter-block">
            <h3>Rating</h3>
            <ul className="listing__radio-list">
              {[
                { value: '', label: 'Any' },
                { value: '4', label: '4★ & up' },
                { value: '3', label: '3★ & up' },
                { value: '2', label: '2★ & up' },
              ].map((opt) => (
                <li key={opt.label}>
                  <label>
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === opt.value}
                      onChange={() => updateParam('rating', opt.value)}
                    />
                    {opt.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="listing__main">
          {hasActiveFilters && (
            <div className="listing__chips">
              {featuredOnly && (
                <span className="listing__chip">
                  Hot Offers
                  <button onClick={() => updateParam('featured', '')}>×</button>
                </span>
              )}
              {categorySlug && (
                <span className="listing__chip">
                  {activeCategoryName}
                  <button onClick={() => updateParam('category', '')}>×</button>
                </span>
              )}
              {selectedBrands.map((b) => (
                <span className="listing__chip" key={b}>
                  {b}
                  <button onClick={() => toggleListParam('brands', b, selectedBrands)}>×</button>
                </span>
              ))}
              {selectedFeatures.map((f) => (
                <span className="listing__chip" key={f}>
                  {f}
                  <button onClick={() => toggleListParam('features', f, selectedFeatures)}>×</button>
                </span>
              ))}
              {condition !== 'any' && (
                <span className="listing__chip">
                  {condition === 'in_stock' ? 'In stock' : 'Out of stock'}
                  <button onClick={() => updateParam('condition', '')}>×</button>
                </span>
              )}
              {minRating && (
                <span className="listing__chip">
                  {minRating}★ & up
                  <button onClick={() => updateParam('rating', '')}>×</button>
                </span>
              )}
              <button className="listing__clear-all" onClick={clearAllFilters}>Clear all filters</button>
            </div>
          )}

          <div className="listing__toolbar">
            <span className="listing__count">{filtered.length} items</span>
            <div className="listing__toolbar-right">
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top rated</option>
              </select>
              <div className="listing__view-toggle">
                <button
                  aria-label="Grid view"
                  className={view === 'grid' ? 'is-active' : ''}
                  onClick={() => setView('grid')}
                >
                  ▦
                </button>
                <button
                  aria-label="List view"
                  className={view === 'list' ? 'is-active' : ''}
                  onClick={() => setView('list')}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={view === 'grid' ? 'listing__grid' : 'listing__list'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="listing__skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="listing__empty">
              <p>No products match your filters.</p>
              {hasActiveFilters && (
                <button className="listing__clear-all" onClick={clearAllFilters}>Clear all filters</button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="listing__grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="listing__list">
              {filtered.map((product) => (
                <ListRow key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListRow({ product, onAddToCart }) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  return (
    <div className="list-row">
      <Link to={`/products/${product.id}`} className="list-row__image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </Link>
      <div className="list-row__body">
        <Link to={`/products/${product.id}`} className="list-row__name">{product.name}</Link>
        <p className="list-row__desc">{product.description}</p>
        <div className="list-row__meta">
          <span>★ {product.rating}</span>
          {product.brand && <span>{product.brand}</span>}
          {product.stock > 0 ? <span className="list-row__stock">In stock</span> : <span>Out of stock</span>}
        </div>
      </div>
      <div className="list-row__price-col">
        <div className="list-row__price">${Number(product.price).toFixed(2)}</div>
        {hasDiscount && (
          <div className="list-row__compare">${Number(product.compare_at_price).toFixed(2)}</div>
        )}
        <button onClick={() => onAddToCart(product)} disabled={product.stock <= 0}>
          {product.stock > 0 ? 'Add to cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}