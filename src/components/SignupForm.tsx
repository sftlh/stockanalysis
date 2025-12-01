'use client'

import { useState } from 'react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Signup successful! Check your email for verification.')
      } else {
        setMessage(data.error)
      }
    } catch {
      setMessage('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card card-modern p-8 w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Create Account</h2>
        <p className="text-white/70">Join our professional financial platform</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
              placeholder="Create a password"
            />
          </div>
        </div>
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="relative mr-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
        {message && (
          <div className="mt-6 text-center p-4 rounded-xl bg-white/10 border border-white/20">
            <p className="text-sm font-medium text-white/90">{message}</p>
          </div>
        )}
        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
            Already have an account? <span className="text-white font-semibold">Sign in</span>
          </a>
        </div>
      </form>
    </div>
  )
}