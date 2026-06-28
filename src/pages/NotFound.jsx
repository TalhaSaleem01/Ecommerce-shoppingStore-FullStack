import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: 48, margin: '0 0 8px' }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
        We couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        to="/"
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          padding: '10px 22px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
        }}
      >
        Back to home
      </Link>
    </div>
  )
}
