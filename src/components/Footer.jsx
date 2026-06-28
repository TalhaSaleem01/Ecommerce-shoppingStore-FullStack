import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__newsletter">
        <h3>Subscribe to our newsletter</h3>
        <p>Get updates on new arrivals and offers, straight to your inbox.</p>
        <form
          className="site-footer__form"
          onSubmit={(e) => {
            e.preventDefault()
            e.target.reset()
          }}
        >
          <input type="email" placeholder="Email address" required aria-label="Email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <div className="container site-footer__columns">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            <span className="site-footer__logo-badge">🛍</span>
            <span>Brand</span>
          </Link>
          <p>Quality products, fast shipping, and a store built for a great shopping experience.</p>
        </div>

        <div className="site-footer__col">
          <h4>About</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products">Categories</Link>
        </div>

        <div className="site-footer__col">
          <h4>Information</h4>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">My Cart</Link>
        </div>

        <div className="site-footer__col">
          <h4>For users</h4>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Register</Link>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Brand. All rights reserved.</span>
      </div>
    </footer>
  )
}
