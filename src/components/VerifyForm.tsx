'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyForm() {
  const [message, setMessage] = useState('Verifying...')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link')
      return
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setMessage('Email verified successfully! Redirecting to login...')
          setTimeout(() => router.push('/auth/login'), 2000)
        } else {
          setMessage(data.error || 'Verification failed')
        }
      })
      .catch(() => setMessage('Verification failed'))
  }, [token, router])

  return (
    <div className="glass-card card-modern p-12 w-full max-w-md text-center fade-in-up">
      <div className="mb-8">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Email Verification</h2>
        <p className="text-white/70">{message}</p>
      </div>
    </div>
  )
}