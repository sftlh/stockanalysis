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
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border border-green-200 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-green-800">Sign Up</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-green-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-green-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-green-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 shadow-md">
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {message && <p className="mt-4 text-center text-sm font-medium text-green-700">{message}</p>}
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-sm text-green-600 hover:text-green-700">Already have an account? <span className="text-green-700 font-medium">Login</span></a>
      </div>
    </form>
  )
}