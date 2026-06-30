import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchCategories } from '../lib/products'
import {
  Flame,
  Gift,
  Grid3X3,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  User,
  UserPlus,
  X,
} from 'lucide-react'
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
  const displayName = profile?.full_name || user?.email || 'Guest'

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

  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [menuOpen])

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

  function handleProfileClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setProfileOpen((v) => !v)
  }

  return (
    <header className="site-header">
      <div className="container site-header__row">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-badge">
            <ShoppingBag size={18} color="#fff" />
          </span>
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
          <button type="submit" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        <nav className="site-header__actions">
          <div className="site-header__profile" ref={profileRef}>
            <button
              className="site-header__action"
              onClick={handleProfileClick}
              aria-haspopup={user ? 'true' : undefined}
              aria-expanded={user ? profileOpen : undefined}
            >
              <User size={20} />
              <span>{user ? 'Profile' : 'Sign in'}</span>
            </button>

            {user && profileOpen && (
              <div className="site-header__dropdown">
                <span className="site-header__dropdown-name">{displayName}</span>
                <Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link>
                {isAdmin && <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>}
                <button onClick={handleSignOut}>Log out</button>
              </div>
            )}
          </div>

          <Link to="/help" className="site-header__action site-header__action--drawer-only">
            <MessageCircle size={20} />
            <span>Message</span>
          </Link>

          <Link to="/orders" className="site-header__action site-header__action--drawer-only">
            <ShoppingBag size={20} />
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

      <form className="site-header__search site-header__search--mobile container" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button type="submit" aria-label="Search">
          <Search size={18} />
        </button>
      </form>

      <div className="site-header__mobile-categories container">
        <Link
          to="/products"
          className={!categorySlug ? 'is-active' : ''}
          onClick={() => setCategorySlug('')}
        >
          All categories
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className={categorySlug === cat.slug ? 'is-active' : ''}
          >
            {cat.name}
          </Link>
        ))}
      </div>

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
      </div>

      {menuOpen && (
        <div className="site-header__mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`site-header__mobile-drawer ${menuOpen ? 'is-open' : ''}`}>
        <div className="site-header__mobile-drawer-header">
          <div className="site-header__mobile-user">
            <span className="site-header__mobile-user-avatar">
              <User size={18} />
            </span>
            <div>
              <span className="site-header__mobile-user-label">{user ? 'Signed in as' : 'Welcome'}</span>
              <strong>{displayName}</strong>
            </div>
          </div>
          <button
            type="button"
            className="site-header__mobile-drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="site-header__mobile-nav">
          <Link to="/help" onClick={() => setMenuOpen(false)}>
            <MessageCircle size={18} />
            <span>Message</span>
          </Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>
            <Package size={18} />
            <span>Orders</span>
          </Link>
          <Link to="/products?featured=true" onClick={() => setMenuOpen(false)}>
            <Flame size={18} />
            <span>Hot offers</span>
          </Link>
          <Link to="/products?category=accessories" onClick={() => setMenuOpen(false)}>
            <Gift size={18} />
            <span>Gift boxes</span>
          </Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>
            <Grid3X3 size={18} />
            <span>Projects</span>
          </Link>
          <Link to="/products?category=home-outdoor" onClick={() => setMenuOpen(false)}>
            <Home size={18} />
            <span>Menu item</span>
          </Link>
          <Link to="/help" onClick={() => setMenuOpen(false)}>
            <HelpCircle size={18} />
            <span>Help</span>
          </Link>
        </div>

        <div className="site-header__mobile-nav-divider" />

        <div className="site-header__mobile-drawer-footer">
          {user ? (
            <button
              type="button"
              className="site-header__mobile-logout"
              onClick={async () => {
                await handleSignOut()
                setMenuOpen(false)
              }}
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <LogIn size={18} />
                <span>Log in</span>
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                <UserPlus size={18} />
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
