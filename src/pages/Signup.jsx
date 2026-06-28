import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    const { data, error } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data?.session) {
      navigate('/')
    } else {
      setInfo('Account created! Check your email to confirm, then log in.')
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1>Create an account</h1>
        <p className="auth__subtitle">Sign up to start shopping and track your orders.</p>

        <form onSubmit={handleSubmit} className="auth__form">
          <label>
            Full name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          {error && <p className="auth__error">{error}</p>}
          {info && <p className="auth__info">{info}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="auth__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
