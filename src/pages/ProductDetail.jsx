import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductById, fetchRelatedProducts } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import ProductCard from '../components/ProductCard'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [loading, setLoading] = useState(true)

  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await fetchProductById(id)
      setProduct(data)
      setQuantity(1)
      if (data?.category_id) {
        const { data: relatedData } = await fetchRelatedProducts(data.category_id, data.id)
        setRelated(relatedData)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleAddToCart() {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(product.id, quantity)
    showToast(error ? 'Could not add to cart' : `Added ${quantity} × "${product.name}" to cart`, error ? 'error' : 'success')
  }

  async function handleRelatedAdd(p) {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(p.id, 1)
    showToast(error ? 'Could not add to cart' : `Added "${p.name}" to cart`, error ? 'error' : 'success')
  }

  if (loading) return <div className="container detail__loading">Loading...</div>
  if (!product) return <div className="container detail__loading">Product not found.</div>

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <div className="container detail">
      <div className="detail__breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">{product.category?.name || 'Products'}</Link> / <span>{product.name}</span>
      </div>

      <div className="detail__top">
        <div className="detail__image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </div>

        <div className="detail__info">
          <span className={product.stock > 0 ? 'detail__stock detail__stock--in' : 'detail__stock detail__stock--out'}>
            {product.stock > 0 ? '✓ In stock' : '✕ Out of stock'}
          </span>
          <h1>{product.name}</h1>
          <div className="detail__rating">
            <span className="detail__stars">{'★'.repeat(Math.round(product.rating || 0))}</span>
            <span>{product.rating} rating</span>
          </div>

          <div className="detail__price-box">
            <span className="detail__price">${Number(product.price).toFixed(2)}</span>
            {hasDiscount && <span className="detail__compare-price">${Number(product.compare_at_price).toFixed(2)}</span>}
          </div>

          <dl className="detail__specs">
            <div>
              <dt>Category</dt>
              <dd>{product.category?.name || '—'}</dd>
            </div>
            {product.brand && (
              <div>
                <dt>Brand</dt>
                <dd>{product.brand}</dd>
              </div>
            )}
            <div>
              <dt>Availability</dt>
              <dd>{product.stock} units left</dd>
            </div>
          </dl>

          {product.features?.length > 0 && (
            <ul className="detail__feature-tags">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}

          <div className="detail__purchase-row">
            <div className="detail__qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="detail__add-btn" onClick={handleAddToCart} disabled={product.stock <= 0}>
              {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail__tabs">
        <div className="detail__tab-headers">
          {['description', 'shipping'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'description' ? 'Description' : 'Shipping & Returns'}
            </button>
          ))}
        </div>
        <div className="detail__tab-content">
          {activeTab === 'description' ? (
            <p>{product.description || 'No description provided for this product yet.'}</p>
          ) : (
            <p>Standard shipping takes 3–7 business days. Returns are accepted within 30 days of delivery in original condition.</p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="detail__related">
          <h2>You may also like</h2>
          <div className="detail__related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleRelatedAdd} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
