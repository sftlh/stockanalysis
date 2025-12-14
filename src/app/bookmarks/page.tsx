'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import BookmarkedIssuersList from '@/components/BookmarkedIssuersList';

export default function BookmarksPage() {
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
                <h1 className="text-lg font-semibold text-white">My Bookmarks</h1>
                <p className="text-xs text-white/60">Saved Investments</p>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl mb-6 pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-3">My Bookmarks</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Your favorite issuers and their complete financial reports for focused analysis
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="glass-card card-modern p-12 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Bookmarks</h3>
            <p className="text-white/70">Fetching your favorite issuers...</p>
          </div>
        }>
          <BookmarkedIssuersList />
        </Suspense>
      </div>
    </div>
  );
}