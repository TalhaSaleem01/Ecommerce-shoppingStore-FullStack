import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { placeOrder } from '../lib/orders'
import './Checkout.css'

const SHIPPING_FLAT = 10
const TAX_RATE = 0.05

const initialCheckoutDetails = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
}

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [placing, setPlacing] = useState(false)
  const [checkoutDetails, setCheckoutDetails] = useState(initialCheckoutDetails)
  const [checkoutErrors, setCheckoutErrors] = useState({})

  const discount = Number(location.state?.discount || 0)
  const tax = subtotal * TAX_RATE
  const shipping = items.length > 0 ? SHIPPING_FLAT : 0
  const total = Math.max(0, subtotal - discount + tax + shipping)

  function handleCheckoutChange(e) {
    const { name, value } = e.target
    setCheckoutDetails((details) => ({ ...details, [name]: value }))
    setCheckoutErrors((errors) => ({ ...errors, [name]: '' }))
  }

  function validateCheckoutDetails() {
    const errors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneDigits = checkoutDetails.phone.replace(/\D/g, '')

    if (!checkoutDetails.fullName.trim()) errors.fullName = 'Full name is required'
    if (!emailPattern.test(checkoutDetails.email.trim())) errors.email = 'Enter a valid email address'
    if (phoneDigits.length < 10) errors.phone = 'Enter a valid phone number'
    if (checkoutDetails.address.trim().length < 8) errors.address = 'Enter a complete address'
    if (!checkoutDetails.city.trim()) errors.city = 'City is required'
    if (checkoutDetails.postalCode.trim().length < 3) errors.postalCode = 'Postal code is required'

    setCheckoutErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleConfirmOrder(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (items.length === 0 || !validateCheckoutDetails()) return

    setPlacing(true)
    const orderDetails = {
      customer: {
        fullName: checkoutDetails.fullName.trim(),
        email: checkoutDetails.email.trim(),
        phone: checkoutDetails.phone.trim(),
        address: checkoutDetails.address.trim(),
        city: checkoutDetails.city.trim(),
        postalCode: checkoutDetails.postalCode.trim(),
        notes: checkoutDetails.notes.trim(),
      },
      totals: { subtotal, discount, shipping, tax, total },
    }
    const { error } = await placeOrder(user.id, items, total, orderDetails)
    setPlacing(false)
    if (error) {
      showToast('Checkout failed - please try again', 'error')
      return
    }
    showToast('Order placed successfully!', 'success')
    await refreshCart()
    navigate('/orders')
  }

  if (!user) {
    return (
      <div className="container checkout checkout--empty">
        <h1>Checkout</h1>
        <p>Log in to continue checkout.</p>
        <Link to="/login" className="checkout__primary-link">Log in</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container checkout checkout--empty">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/products" className="checkout__primary-link">Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="container checkout">
      <div className="checkout__head">
        <div>
          <h1>Checkout</h1>
          <p>Enter your delivery details before confirming the order.</p>
        </div>
        <Link to="/cart" className="checkout__back-link">Back to cart</Link>
      </div>

      <div className="checkout__layout">
        <form className="checkout__form" onSubmit={handleConfirmOrder} noValidate>
          <h2>Customer details</h2>
          <CheckoutField
            label="Full name"
            name="fullName"
            value={checkoutDetails.fullName}
            error={checkoutErrors.fullName}
            onChange={handleCheckoutChange}
            autoComplete="name"
          />
          <CheckoutField
            label="Email"
            name="email"
            type="email"
            value={checkoutDetails.email}
            error={checkoutErrors.email}
            onChange={handleCheckoutChange}
            autoComplete="email"
          />
          <CheckoutField
            label="Phone number"
            name="phone"
            type="tel"
            value={checkoutDetails.phone}
            error={checkoutErrors.phone}
            onChange={handleCheckoutChange}
            autoComplete="tel"
          />
          <CheckoutField
            label="Address"
            name="address"
            value={checkoutDetails.address}
            error={checkoutErrors.address}
            onChange={handleCheckoutChange}
            autoComplete="street-address"
          />
          <div className="checkout__grid">
            <CheckoutField
              label="City"
              name="city"
              value={checkoutDetails.city}
              error={checkoutErrors.city}
              onChange={handleCheckoutChange}
              autoComplete="address-level2"
            />
            <CheckoutField
              label="Postal code"
              name="postalCode"
              value={checkoutDetails.postalCode}
              error={checkoutErrors.postalCode}
              onChange={handleCheckoutChange}
              autoComplete="postal-code"
            />
          </div>
          <label className="checkout__field">
            <span>Order notes</span>
            <textarea
              name="notes"
              value={checkoutDetails.notes}
              onChange={handleCheckoutChange}
              rows={3}
              placeholder="Optional delivery notes"
            />
          </label>
          <button type="submit" className="checkout__confirm" disabled={placing}>
            {placing ? 'Placing order...' : 'Confirm order'}
          </button>
        </form>

        <aside className="checkout__summary">
          <h2>Order summary</h2>
          <div className="checkout__items">
            {items.map((row) => (
              <div key={row.id} className="checkout__item">
                <span>{row.product.name}</span>
                <strong>${(Number(row.product.price) * row.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className="checkout__totals">
            <div><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="checkout__discount"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
            <div><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="checkout__total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CheckoutField({ label, name, value, error, onChange, type = 'text', autoComplete }) {
  return (
    <label className="checkout__field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
      />
      {error && <small>{error}</small>}
    </label>
  )
}
