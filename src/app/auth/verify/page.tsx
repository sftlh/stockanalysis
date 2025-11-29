import { Suspense } from 'react'
import VerifyForm from '@/components/VerifyForm'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:60px_60px] opacity-40"></div>
      <Suspense fallback={
        <div className="glass-card card-modern p-12 text-center fade-in-up">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      }>
        <VerifyForm />
      </Suspense>
    </div>
  )
}