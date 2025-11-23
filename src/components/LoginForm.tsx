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
    <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8 w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Sign In</h2>
        <p className="text-green-600">Access your financial dashboard</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
              placeholder="Enter your password"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 font-medium disabled:opacity-50 shadow-md hover:shadow-lg relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        <div className="mt-4 text-center space-y-2">
          <a href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
            Forgot your password?
          </a>
          <br />
          <a href="/auth/signup" className="text-sm text-green-600 hover:text-green-700">
            Don&apos;t have an account? <span className="text-green-700 font-medium">Sign up</span>
          </a>
        </div>
      </form>
    </div>
  )
}