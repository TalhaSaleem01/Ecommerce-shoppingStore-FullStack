import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { placeOrder } from '../lib/orders'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import './Cart.css'

const SHIPPING_FLAT = 10
const TAX_RATE = 0.05

export default function Cart() {
  const { items, savedItems, subtotal, updateQuantity, removeItem, removeAll, saveForLater, refreshCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [placing, setPlacing] = useState(false)

  const tax = subtotal * TAX_RATE
  const shipping = items.length > 0 ? SHIPPING_FLAT : 0
  const total = Math.max(0, subtotal - discount + tax + shipping)

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.1)
      showToast('Coupon applied — 10% off', 'success')
    } else {
      setDiscount(0)
      showToast('Invalid coupon code', 'error')
    }
  }

  async function handleCheckout() {
    if (!user) {
      navigate('/login')
      return
    }
    if (items.length === 0) return
    setPlacing(true)
    const { error } = await placeOrder(user.id, items, total)
    setPlacing(false)
    if (error) {
      showToast('Checkout failed — please try again', 'error')
      return
    }
    showToast('Order placed successfully!', 'success')
    await refreshCart()
    navigate('/orders')
  }

  if (!user) {
    return (
      <div className="container cart cart--empty-state">
        <h1>My cart</h1>
        <p>Log in to view your cart and start shopping.</p>
        <Link to="/login" className="cart__cta">Log in</Link>
      </div>
    )
  }

  return (
    <div className="container cart">
      <h1>My cart ({items.length})</h1>

      {items.length === 0 ? (
        <div className="cart__empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="cart__cta">Back to shop</Link>
        </div>
      ) : (
        <div className="cart__layout">
          <div className="cart__items">
            {items.map((row) => (
              <CartRow
                key={row.id}
                row={row}
                onQuantity={(q) => updateQuantity(row.id, q)}
                onRemove={() => removeItem(row.id)}
                onSave={() => saveForLater(row.id, true)}
              />
            ))}

            <div className="cart__actions-row">
              <Link to="/products" className="cart__back-link">← Back to shop</Link>
              <button className="cart__remove-all" onClick={removeAll}>Remove all</button>
            </div>
          </div>

          <div className="cart__summary">
            <div className="cart__coupon">
              <label htmlFor="coupon">Have a coupon?</label>
              <div className="cart__coupon-row">
                <input
                  id="coupon"
                  placeholder="Add coupon (try SAVE10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button onClick={applyCoupon}>Apply</button>
              </div>
            </div>

            <div className="cart__totals">
              <div className="cart__totals-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="cart__totals-row cart__totals-row--discount">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="cart__totals-row">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="cart__totals-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart__totals-row cart__totals-row--total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="cart__checkout-btn" onClick={handleCheckout} disabled={placing}>
              {placing ? 'Placing order...' : `Checkout (${items.length} item${items.length === 1 ? '' : 's'})`}
            </button>
          </div>
        </div>
      )}

      {savedItems.length > 0 && (
        <section className="cart__saved">
          <h2>Saved for later</h2>
          <div className="cart__saved-grid">
            {savedItems.map((row) => (
              <div key={row.id} className="cart__saved-card">
                <img
                  src={row.product.image_url}
                  alt={row.product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
                <div>
                  <p className="cart__saved-name">{row.product.name}</p>
                  <p className="cart__saved-price">${Number(row.product.price).toFixed(2)}</p>
                  <div className="cart__saved-actions">
                    <button onClick={() => saveForLater(row.id, false)}>Move to cart</button>
                    <button className="cart__saved-remove" onClick={() => removeItem(row.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function CartRow({ row, onQuantity, onRemove, onSave }) {
  const { product, quantity } = row
  return (
    <div className="cart-row">
      <Link to={`/products/${product.id}`} className="cart-row__image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </Link>
      <div className="cart-row__body">
        <Link to={`/products/${product.id}`} className="cart-row__name">{product.name}</Link>
        <p className="cart-row__meta">In stock: {product.stock}</p>
        <div className="cart-row__links">
          <button className="cart-row__remove" onClick={onRemove}>Remove</button>
          <button className="cart-row__save" onClick={onSave}>Save for later</button>
        </div>
      </div>
      <div className="cart-row__qty">
        <button onClick={() => onQuantity(quantity - 1)} aria-label="Decrease quantity">−</button>
        <span>{quantity}</span>
        <button onClick={() => onQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
      </div>
      <div className="cart-row__price">${(Number(product.price) * quantity).toFixed(2)}</div>
    </div>
  )
}
