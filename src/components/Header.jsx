import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchCategories } from '../lib/products'
import './Header.css'

export default function Header() {
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [categories, setCategories] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const profileRef = useRef(null)
  const categoryMenuRef = useRef(null)

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setCategoryMenuOpen(false)
      }
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (categorySlug) params.set('category', categorySlug)
    navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`)
    setMenuOpen(false)
  }

  async function handleSignOut() {
    await signOut()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-badge">🛍</span>
          <span>Brand</span>
        </Link>

        <form className="site-header__search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            aria-label="Filter by category"
            className="site-header__search-category"
          >
            <option value="">All category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <button type="submit">Search</button>
        </form>

        <nav className="site-header__actions">
          <div className="site-header__profile" ref={profileRef}>
            <button
              className="site-header__action"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>{user ? 'Profile' : 'Sign in'}</span>
            </button>

            {profileOpen && (
              <div className="site-header__dropdown">
                {user ? (
                  <>
                    <span className="site-header__dropdown-name">{profile?.full_name || user.email}</span>
                    <Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>}
                    <button onClick={handleSignOut}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setProfileOpen(false)}>Log in</Link>
                    <Link to="/signup" onClick={() => setProfileOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/help" className="site-header__action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5a8.4 8.4 0 0 1-1.1 4.2L21 20l-4.5-1.2A8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span>Message</span>
          </Link>

          <Link to="/orders" className="site-header__action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span>Orders</span>
          </Link>

          <Link to="/cart" className="site-header__action site-header__cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.7 5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" />
              <circle cx="17" cy="20" r="1.2" fill="currentColor" />
            </svg>
            <span>My cart</span>
            {itemCount > 0 && <span className="site-header__cart-badge">{itemCount}</span>}
          </Link>
        </nav>

        <button
          className="site-header__hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <form className="site-header__search site-header__search--mobile container" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      )}

      <div className="site-header__subnav container">
        <div className="site-header__subnav-left">
          <div className="site-header__all-category-wrap" ref={categoryMenuRef}>
            <button
              className="site-header__all-category"
              onClick={() => setCategoryMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={categoryMenuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              All category
            </button>
            {categoryMenuOpen && (
              <div className="site-header__category-dropdown">
                <Link to="/products" onClick={() => setCategoryMenuOpen(false)}>All Categories</Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setCategoryMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/products?featured=true">Hot offers</Link>
          <Link to="/products?category=accessories">Gift boxes</Link>
          <Link to="/products">Projects</Link>
          <Link to="/products?category=home-outdoor">Menu item</Link>
          <Link to="/help">Help</Link>
        </div>
        <div className="site-header__subnav-right">
          <span className="site-header__locale">English, USD</span>
          <span className="site-header__locale">Ship to 🇩🇪</span>
        </div>
      </div>
    </header>
  )
}