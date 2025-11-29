'use client'

import { useRouter } from 'next/navigation'
import StockForm from '@/components/StockForm'

export default function AddStockPage() {
  const router = useRouter()

  const handleFormSubmit = () => {
    // Redirect back to dashboard after successful submission
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white/70 hover:text-white mr-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-white/20 mr-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-white">Add Stock Data</h1>
                <p className="text-xs text-white/60">Portfolio Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/60 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl mb-6 pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-3">Add New Stock</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Enter comprehensive financial data to enhance your portfolio analysis and investment insights
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card card-modern overflow-hidden">
          {/* Form Header */}
          <div className="bg-white/5 px-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center pulse-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Financial Data Entry</h3>
                <p className="text-sm text-white/70">Complete all required fields for accurate analysis</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <StockForm onSubmit={handleFormSubmit} />
          </div>

          {/* Form Footer */}
          <div className="bg-white/5 px-8 py-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>All fields marked with <span className="text-red-400">*</span> are required</span>
              </div>
              <button
                onClick={() => router.push('/')}
                className="btn-outline text-sm font-medium transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/50">
            Need help? Check our <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">documentation</a> for data entry guidelines
          </p>
        </div>
      </main>
    </div>
  )
}