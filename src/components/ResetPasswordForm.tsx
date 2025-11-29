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
    return (
      <div className="glass-card card-modern p-12 text-center max-w-md fade-in-up">
        <div className="mb-6">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h3>
        <p className="text-red-300">This password reset link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card card-modern p-12 w-full max-w-md fade-in-up">
      <div className="text-center mb-8">
        <div className="mb-6">
          <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Reset Password</h2>
        <p className="text-white/70">Enter your new password</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-3 text-white/90">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
            placeholder="Enter new password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-modern btn-primary py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              Resetting Password...
            </div>
          ) : (
            'Reset Password'
          )}
        </button>

        {message && (
          <div className="text-center p-4 rounded-xl bg-white/10 border border-white/20">
            <p className="text-sm font-medium text-white/90">{message}</p>
          </div>
        )}
      </div>
    </form>
  )
}