import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../lib/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE } from '../lib/fallbackImage'
import ProductCard from '../components/ProductCard'
import heroBanner from '../assets/Hero image.jpeg'
import './Home.css'

function useCountdown(hours = 13) {
  const [target] = useState(() => Date.now() + hours * 60 * 60 * 1000)
  const [remaining, setRemaining] = useState(target - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])

  const totalSeconds = Math.floor(remaining / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [recommended, setRecommended] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(13)

  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [featuredRes, recommendedRes, categoriesRes] = await Promise.all([
        fetchProducts({ featured: true, limit: 5 }),
        fetchProducts({ sort: 'newest', limit: 10 }),
        fetchCategories(),
      ])
      setFeatured(featuredRes.data)
      setRecommended(recommendedRes.data)
      setCategories(categoriesRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleAddToCart(product) {
    if (!user) {
      showToast('Please log in to add items to your cart', 'error')
      return
    }
    const { error } = await addToCart(product.id, 1)
    showToast(error ? 'Could not add to cart' : `Added "${product.name}" to cart`, error ? 'error' : 'success')
  }

  return (
    <div className="home">
      <section className="container home__hero-row">
        <aside className="home__category-rail">
          <ul>
            {categories.map((cat, index) => (
              <li key={cat.id}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className={index === 0 ? 'is-active' : ''}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="home__hero">
          <img src={heroBanner} alt="Hero banner" className="home__hero-img" />
        </div>
      </section>

      <section className="container home__section">
        <div className="home__deals">
          <div className="home__deals-info">
            <h2>Deals and offers</h2>
            <p>Hygiene equipments</p>
            <div className="home__countdown">
              <CountdownBox label="Days" value={countdown.days} />
              <CountdownBox label="Hour" value={countdown.hours} />
              <CountdownBox label="Min" value={countdown.minutes} />
              <CountdownBox label="Sec" value={countdown.seconds} />
            </div>
          </div>

          {loading ? (
            <SkeletonRow />
          ) : (
            featured.slice(0, 5).map((product) => (
              <Link to={`/products/${product.id}`} key={product.id} className="home__deal-item">
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
                <p className="home__deal-name">{product.name}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="home__deal-badge">
                    -{Math.round(100 - (product.price / product.compare_at_price) * 100)}%
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </section>

      {CATEGORY_SHOWCASES.map((showcase) => (
        <section className="container home__section" key={showcase.title}>
          <div className="home__showcase">
            <div
              className="home__showcase-banner"
              style={{ backgroundImage: `url(${showcase.bannerImage})` }}
            >
              <div className="home__showcase-banner-overlay">
                <h3>{showcase.title}</h3>
                <Link to={`/products?category=${showcase.categorySlug}`} className="home__showcase-cta">
                  Source now
                </Link>
              </div>
            </div>
            <div className="home__showcase-grid">
              {showcase.items.map((item) => (
                <Link to={`/products?category=${showcase.categorySlug}`} key={item.label} className="home__showcase-item">
                  <div>
                    <p className="home__showcase-item-label">{item.label}</p>
                    <p className="home__showcase-item-price">From USD {item.fromPrice}</p>
                  </div>
                  <img
                    src={item.image}
                    alt={item.label}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="home__quote-banner container">
        <div className="home__quote-banner-inner">
          <div className="home__quote-banner-text">
            <h2>Need help finding the right product?</h2>
            <p>Tell us what you're looking for and we'll help you find it.</p>
          </div>
          <form
            className="home__quote-form"
            onSubmit={(e) => {
              e.preventDefault()
              showToast("Thanks! We'll get back to you shortly.", 'success')
              e.target.reset()
            }}
          >
            <h3>Send us a message</h3>
            <input type="text" placeholder="What item are you looking for?" required />
            <textarea placeholder="Type more details" rows={3} />
            <button type="submit">Send inquiry</button>
          </form>
        </div>
      </section>

      <section className="container home__section">
        <div className="home__section-head">
          <h2>Recommended items</h2>
          <Link to="/products" className="home__see-all">See all -&gt;</Link>
        </div>
        {loading ? (
          <SkeletonRow count={10} />
        ) : (
          <div className="home__grid home__grid--wide">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      <section className="container home__section">
        <h2>Our extra services</h2>
        <div className="home__services-grid">
          {EXTRA_SERVICES.map((service) => (
            <div key={service.title} className="home__service-card">
              <div className="home__service-image-wrap">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGE
                  }}
                />
                <span className="home__service-icon">{service.icon}</span>
              </div>
              <p>{service.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container home__section">
        <h2>We ship worldwide</h2>
        <div className="home__regions-grid">
          {SHIPPING_REGIONS.map((region) => (
            <div key={region.country} className="home__region">
              <span className="home__region-flag">
                <img src={region.flagImage} alt={`${region.country} flag`} loading="lazy" />
              </span>
              <div>
                <p className="home__region-country">{region.country}</p>
                <p className="home__region-detail">{region.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const CATEGORY_SHOWCASES = [
  {
    title: 'Home and outdoor',
    categorySlug: 'home-outdoor',
    bannerImage: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500',
    items: [
      { label: 'FireGlow Tabletop', fromPrice: 34.98, image: 'https://assets.wfcdn.com/im/74581830/compr-r85/3164/316421335/Tabletop+Fire+Pit+Indoor+Concrete+Personal+Table+Top+Firepit+Outdoor+Mini+Portable+Flame+Bowl+for+Smores+Maker+Round+Smokeless+Firepits+for+Patio+Balcony.jpg' },
      { label: 'Hammock Swing Chair', fromPrice: 39.99, image: 'https://antsll.com/wp-content/uploads/2023/10/outdoor-hammock-hanging-chair-nest-hammock-swing-chair-560700.png' },
      { label: 'Solar Garden Lanterns', fromPrice: 24.99, image: 'https://freemans.scene7.com/is/image/OttoUK/355w/Smart-Garden-Pack-of-4-Viva!-Solar-Lanterns~19J652FRSP.jpg' },
      { label: 'Inflatable Air Mattress', fromPrice: 129.97, image: 'https://i5.walmartimages.com/seo/Intex-PremAire-II-Fiber-Tech-Elevated-Air-Mattress-with-Built-In-Pump-Queen_db899a94-12ac-48fa-9c00-ea076b580fef.d4fd406d190a1a2640033392113cf096.jpeg' },
      { label: 'Comfort Seater Sofa', fromPrice: 149.99, image: 'https://tse1.mm.bing.net/th/id/OIP.eRvkyvwHBv88Vg1WyUsmPwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
      { label: 'Comfort 2-Seater Sofa', fromPrice: 200, image: 'https://tse2.mm.bing.net/th/id/OIP.LeCTGxCpnKALAxyqfIN-RwHaFj?rs=1&pid=ImgDetMain&o=7&rm=3' },
    ],
  },
  {
    title: 'Consumer electronics and gadgets',
    categorySlug: 'electronics',
    bannerImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    items: [
      { label: 'Smart watches', fromPrice: 99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
      { label: 'Cameras', fromPrice: 129, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200' },
      { label: 'Headphones', fromPrice: 89, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
      { label: 'Smartphones', fromPrice: 249, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200' },
      { label: 'Laptops & PC', fromPrice: 549, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' },
      { label: 'Speakers', fromPrice: 39, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200' },
    ],
  },
]

const EXTRA_SERVICES = [
  {
    title: 'Easy returns & refunds',
    icon: '↺',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
  },
  {
    title: 'Secure online payments',
    icon: '🔒',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
  },
  {
    title: 'Fast, reliable shipping',
    icon: '✈',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500',
  },
  {
    title: '24/7 customer support',
    icon: '💬',
    image: 'https://images.unsplash.com/photo-1553775282-20af80779df7?w=500',
  },
]

const SHIPPING_REGIONS = [
  { country: 'United States', detail: '3-5 business days', flagImage: 'https://flagcdn.com/w40/us.png' },
  { country: 'United Kingdom', detail: '4-6 business days', flagImage: 'https://flagcdn.com/w40/gb.png' },
  { country: 'Pakistan', detail: '2-4 business days', flagImage: 'https://flagcdn.com/w40/pk.png' },
  { country: 'Australia', detail: '5-7 business days', flagImage: 'https://flagcdn.com/w40/au.png' },
  { country: 'Canada', detail: '4-6 business days', flagImage: 'https://flagcdn.com/w40/ca.png' },
  { country: 'United Arab Emirates', detail: '3-5 business days', flagImage: 'https://flagcdn.com/w40/ae.png' },
]

function CountdownBox({ label, value }) {
  return (
    <div className="home__countdown-box">
      <span>{String(value).padStart(2, '0')}</span>
      <small>{label}</small>
    </div>
  )
}

function SkeletonRow({ count = 5 }) {
  return (
    <div className="home__grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="home__skeleton" />
      ))}
    </div>
  )
}
