'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        // Use window.location for full page reload to ensure auth state is refreshed
        window.location.href = '/'
      } else {
        alert(data.error)
      }
    } catch {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card card-modern p-8 w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
        <p className="text-white/70">Access your professional financial dashboard</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
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
              placeholder="Enter your password"
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
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        <div className="mt-6 text-center space-y-3">
          <a href="/auth/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
            Forgot your password?
          </a>
          <br />
          <a href="/auth/signup" className="text-sm text-white/70 hover:text-white transition-colors duration-200">
            Don&apos;t have an account? <span className="text-white font-semibold">Sign up</span>
          </a>
        </div>
      </form>
    </div>
  )
}