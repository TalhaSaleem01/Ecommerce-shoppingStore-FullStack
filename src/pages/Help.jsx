import { Link } from 'react-router-dom'
import './Help.css'

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders from the account menu to see the status of every order you\'ve placed.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Checkout is currently set up for demonstration purposes as part of this project — no real payment is processed.',
  },
  {
    q: 'How do I return an item?',
    a: 'Contact us using the inquiry form on the home page and we\'ll help arrange a return.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Shipping times vary by region — see the "We ship worldwide" section on the home page for estimates.',
  },
  {
    q: 'Do you have an admin panel?',
    a: 'Yes — store admins can manage products from the Admin link in the header once their account is granted admin access.',
  },
]

export default function Help() {
  return (
    <div className="container help">
      <h1>Help &amp; FAQs</h1>
      <p className="help__intro">
        Find quick answers below, or use the contact form on the{' '}
        <Link to="/">home page</Link> to reach us directly.
      </p>

      <div className="help__list">
        {FAQS.map((item) => (
          <div className="help__item" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}