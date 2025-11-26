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
    <div className="bg-white p-6 border border-gray-300 w-full max-w-md text-center card-flat">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Email Verification</h2>
      <p className="text-gray-700">{message}</p>
    </div>
  )
}