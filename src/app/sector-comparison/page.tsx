'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import SectorComparisonTable from '@/components/SectorComparisonTable';

export default function SectorComparisonPage() {
  const router = useRouter();

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
                <h1 className="text-lg font-semibold text-white">Sector Comparison</h1>
                <p className="text-xs text-white/60">Advanced Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/60 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-2xl mb-6 pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-3">Sector Comparison</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Compare stock performance and metrics across different sectors for informed investment decisions
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="glass-card card-modern p-12 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Sector Data</h3>
            <p className="text-white/70">Preparing advanced analytics...</p>
          </div>
        }>
          <SectorComparisonTable />
        </Suspense>
      </div>
    </div>
  );
}