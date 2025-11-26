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
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-300 w-full max-w-md card-flat">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign Up</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded btn-flat disabled:opacity-50">
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {message && <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>}
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">Already have an account? <span className="text-blue-700 font-medium">Login</span></a>
      </div>
    </form>
  )
}