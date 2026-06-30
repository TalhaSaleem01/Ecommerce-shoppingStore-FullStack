import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, isDrawerOpen, closeDrawer } = useCart()

  return (
    <>
      {isDrawerOpen && <div className="cart-drawer__overlay" onClick={closeDrawer} />}

      <aside className={`cart-drawer ${isDrawerOpen ? 'is-open' : ''}`}>
        <div className="cart-drawer__header">
          <h3>My cart ({itemCount})</h3>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>Your cart is empty.</p>
              <Link to="/products" className="cart-drawer__shop-link" onClick={closeDrawer}>
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map((row) => (
                <li key={row.id} className="cart-drawer__item">
                  <Link to={`/products/${row.product.id}`} className="cart-drawer__item-image" onClick={closeDrawer}>
                    <img
                      src={row.product.image_url}
                      alt={row.product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = FALLBACK_IMAGE
                      }}
                    />
                  </Link>
                  <div className="cart-drawer__item-body">
                    <Link to={`/products/${row.product.id}`} className="cart-drawer__item-name" onClick={closeDrawer}>
                      {row.product.name}
                    </Link>
                    <div className="cart-drawer__item-row">
                      <div className="cart-drawer__qty">
                        <button onClick={() => updateQuantity(row.id, row.quantity - 1)} aria-label="Decrease quantity">−</button>
                        <span>{row.quantity}</span>
                        <button onClick={() => updateQuantity(row.id, row.quantity + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <span className="cart-drawer__item-price">
                        ${(Number(row.product.price) * row.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button className="cart-drawer__remove" onClick={() => removeItem(row.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link to="/cart" className="cart-drawer__view-cart-btn" onClick={closeDrawer}>
              View cart & checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
