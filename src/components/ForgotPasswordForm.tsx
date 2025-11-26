'use client'

import { useState } from 'react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      setMessage(data.message)
    } catch {
      setMessage('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-300 w-full max-w-md card-flat">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Forgot Password</h2>
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
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded btn-flat disabled:opacity-50">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      {message && <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>}
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">Back to <span className="text-blue-700 font-medium">Login</span></a>
      </div>
    </form>
  )
}