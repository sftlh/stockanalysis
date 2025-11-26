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
    <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-300 w-full max-w-md card-flat">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reset Password</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded btn-flat disabled:opacity-50">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>}
    </form>
  )
}