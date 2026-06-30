import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react'
import { useLocale } from '../context/LocaleContext'
import './Footer.css'

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false)
  const { country, setCountry, countries } = useLocale()

  const selectedCountry = countries.find((c) => c.name === country) || countries[0]

  return (
    <footer className="site-footer">
      <div className="container site-footer__newsletter">
        <h3>Subscribe on our newsletter</h3>
        <p>Get daily news on upcoming offers from many suppliers all over the world</p>
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
            <span className="site-footer__logo-badge">
              <ShoppingBag size={20} color="#fff" />
            </span>
            <span>Brand</span>
          </Link>
          <p>Best information about the company goes here but now lorem ipsum is</p>
          <div className="site-footer__socials">
            <a href="/" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.8c0-2.6 1.5-4 3.8-4 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
              </svg>
            </a>
            <a href="/" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.4 1.8-2.4-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.2 4.6a4 4 0 0 0 1.2 5.3A4 4 0 0 1 2.6 9c0 1.9 1.4 3.6 3.2 4a4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8 8 8 0 0 1-5.9 1.6 11.3 11.3 0 0 0 6.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2-2.1Z" />
              </svg>
            </a>
            <a href="/" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.3 18V9.7H5.7V18h2.6Zm-1.3-9.4c.9 0 1.4-.6 1.4-1.3 0-.8-.5-1.3-1.4-1.3s-1.4.5-1.4 1.3c0 .7.5 1.3 1.4 1.3ZM18.3 18v-4.6c0-2.5-1.3-3.6-3.1-3.6-1.4 0-2 .8-2.4 1.3V9.7h-2.6v8.3h2.6v-4.6c0-1.2.7-2 1.7-2 1 0 1.5.7 1.5 2V18h2.3Z" />
              </svg>
            </a>
            <a href="/" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.2.6 1.8 1.2.5.5.9 1 1.2 1.7.3.7.5 1.4.5 2.5.1 1 .1 1.4.1 4.1s0 3-.1 4c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.2-1.2 1.8-.5.5-1 .9-1.7 1.2-.7.3-1.4.5-2.5.5-1.1.1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.2-.6-1.8-1.2-.5-.5-.9-1-1.2-1.7-.3-.7-.5-1.4-.5-2.5-.1-1.1-.1-1.4-.1-4.1s0-3.1.1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.2 1.2-1.8.5-.5 1-.9 1.7-1.2.7-.3 1.4-.5 2.5-.5C8.9 2 9.3 2 12 2Zm0 1.8c-2.6 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.4-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.7.3 1 .1 1.4.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.7.1-1 .1-1.4.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.7-.3-1-.1-1.4-.1-4-.1Zm0 3.4a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5-2.2a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z" />
              </svg>
            </a>
            <a href="/" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.8 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-8 .4a2.5 2.5 0 0 0-1.8 1.8C2 9 2 12 2 12s0 3 .2 4.8c.2.9.9 1.6 1.8 1.8C5.7 19 12 19 12 19s6.3 0 8-.4a2.5 2.5 0 0 0 1.8-1.8c.2-1.8.2-4.8.2-4.8s0-3-.2-4.8ZM10 15V9l5.2 3-5.2 3Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="site-footer__col">
          <h4>About</h4>
          <Link to="/">About Us</Link>
          <Link to="/products">Find store</Link>
          <Link to="/products">Categories</Link>
          <Link to="/">Blogs</Link>
        </div>

        <div className="site-footer__col">
          <h4>Partnership</h4>
          <Link to="/">About Us</Link>
          <Link to="/products">Find store</Link>
          <Link to="/products">Categories</Link>
          <Link to="/">Blogs</Link>
        </div>

        <div className="site-footer__col">
          <h4>Information</h4>
          <Link to="/help">Help Center</Link>
          <Link to="/">Money Refund</Link>
          <Link to="/">Shipping</Link>
          <Link to="/">Contact us</Link>
        </div>

        <div className="site-footer__col">
          <h4>For users</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Register</Link>
          <Link to="/">Settings</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div className="site-footer__col site-footer__apps">
          <h4>Get app</h4>
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" />
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" />
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Ecommerce.</span>
        <div className="site-footer__lang-wrap">
          <button
            className="site-footer__lang"
            onClick={() => setLangOpen((open) => !open)}
            type="button"
          >
            <span>{selectedCountry?.flag}</span>
            <span>{selectedCountry?.name}</span>
            {langOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {langOpen && (
            <ul className="site-footer__lang-menu">
              {countries.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setCountry(c.name)
                      setLangOpen(false)
                    }}
                  >
                    <span>{c.flag}</span> {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
