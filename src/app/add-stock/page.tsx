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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mr-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-slate-300 mr-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Add Stock Data</h1>
                <p className="text-xs text-slate-500">Portfolio Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Add New Stock</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter comprehensive financial data to enhance your portfolio analysis and investment insights
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Form Header */}
          <div className="bg-linear-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Financial Data Entry</h3>
                <p className="text-sm text-slate-600">Complete all required fields for accurate analysis</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <StockForm onSubmit={handleFormSubmit} />
          </div>

          {/* Form Footer */}
          <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>All fields marked with <span className="text-red-500">*</span> are required</span>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help? Check our <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">documentation</a> for data entry guidelines
          </p>
        </div>
      </main>
    </div>
  )
}