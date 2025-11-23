'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setMessage(data.error)
      }
    } catch {
      setMessage('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return <p className="text-sm text-red-600 font-medium">Invalid reset link</p>
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border border-green-200 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-green-800">Reset Password</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-green-700">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 shadow-md">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p className="mt-4 text-center text-sm font-medium text-green-700">{message}</p>}
    </form>
  )
}