import { Link } from 'react-router-dom'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import './ProductCard.css'

export default function ProductCard({ product, onAddToCart }) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.compare_at_price) * 100)
    : null

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__image-wrap">
        {hasDiscount && <span className="product-card__badge">-{discountPct}%</span>}
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </Link>
      <div className="product-card__body">
        <Link to={`/products/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        <div className="product-card__rating">
          <span className="product-card__stars">{'★'.repeat(Math.round(product.rating || 0))}</span>
          <span className="product-card__rating-num">{product.rating ?? '—'}</span>
        </div>
        <div className="product-card__prices">
          <span className="product-card__price">${Number(product.price).toFixed(2)}</span>
          {hasDiscount && (
            <span className="product-card__compare-price">
              ${Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
        </div>
        {onAddToCart && (
          <button
            className="product-card__add-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
        )}
      </div>
    </div>
  )
}
