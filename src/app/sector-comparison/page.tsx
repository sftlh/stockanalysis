'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import SectorComparisonTable from '@/components/SectorComparisonTable';

export default function SectorComparisonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sector Comparison</h1>
          <p className="text-gray-600">Compare stock performance and metrics across different sectors</p>
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading sector data...</div>}>
          <SectorComparisonTable />
        </Suspense>
      </div>
    </div>
  );
}