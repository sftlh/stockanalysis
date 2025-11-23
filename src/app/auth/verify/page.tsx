import { Suspense } from 'react'
import VerifyForm from '@/components/VerifyForm'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  )
}