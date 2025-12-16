'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';

interface StockData {
  id: number;
  issuerName: string;
  netProfit: number;
  eps: number;
  outstandingShares: number;
  currentPrice: number;
  totalEquity: number;
  totalDebt: number;
  dividends: number;
  quarter: number;
  year: number;
  sector?: string;
  bookmarked: boolean;
}

interface IssuerSummary {
  name: string;
  sector?: string;
  latestPrice: number;
  totalReports: number;
  latestQuarter: number;
  latestYear: number;
  avgPER: number;
  avgROE: number;
}

export default function BookmarkedIssuersList() {
  const router = useRouter();
  const [issuers, setIssuers] = useState<IssuerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarkedIssuers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stockdata?bookmarked=true');
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarked stocks');
        }
        const bookmarkedStocks: StockData[] = await response.json();

        // Group stocks by issuer and create summaries
        const issuerMap = new Map<string, StockData[]>();

        bookmarkedStocks.forEach(stock => {
          if (!issuerMap.has(stock.issuerName)) {
            issuerMap.set(stock.issuerName, []);
          }
          issuerMap.get(stock.issuerName)!.push(stock);
        });

        const issuerSummaries: IssuerSummary[] = Array.from(issuerMap.entries()).map(([name, stocks]) => {
          // Sort stocks by year and quarter (most recent first)
          const sortedStocks = stocks.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.quarter - a.quarter;
          });

          const latestStock = sortedStocks[0];

          // Calculate averages
          const validPERs = sortedStocks
            .map(stock => stock.eps !== 0 ? stock.currentPrice / stock.eps : null)
            .filter(per => per !== null && !isNaN(per)) as number[];

          const validROEs = sortedStocks
            .map(stock => stock.totalEquity !== 0 ? (stock.netProfit / stock.totalEquity) * 100 : null)
            .filter(roe => roe !== null && !isNaN(roe)) as number[];

          const avgPER = validPERs.length > 0 ? validPERs.reduce((a, b) => a + b, 0) / validPERs.length : 0;
          const avgROE = validROEs.length > 0 ? validROEs.reduce((a, b) => a + b, 0) / validROEs.length : 0;

          return {
            name,
            sector: latestStock.sector,
            latestPrice: latestStock.currentPrice,
            totalReports: stocks.length,
            latestQuarter: latestStock.quarter,
            latestYear: latestStock.year,
            avgPER,
            avgROE
          };
        });

        setIssuers(issuerSummaries);
      } catch (err) {
        console.error('Error fetching bookmarked issuers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookmarked issuers');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedIssuers();

    // Listen for global stock data changes (e.g., new reports added)
    const onStockDataChanged = () => {
      fetchBookmarkedIssuers();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('stockdata:changed', onStockDataChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('stockdata:changed', onStockDataChanged);
      }
    };
  }, []);

  const handleIssuerClick = (issuerName: string) => {
    router.push(`/bookmarks/${encodeURIComponent(issuerName)}`);
  };

  if (loading) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Loading Bookmarks</h3>
        <p className="text-white/70">Fetching your bookmarked issuers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Bookmarks</h3>
        <p className="text-white/70">{error}</p>
      </div>
    );
  }

  if (issuers.length === 0) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/20 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Bookmarked Issuers</h3>
        <p className="text-white/70 mb-6">You haven&apos;t bookmarked any issuers yet. Start by bookmarking stocks from the main portfolio.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary"
        >
          View Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {issuers.map((issuer) => (
        <div
          key={issuer.name}
          onClick={() => handleIssuerClick(issuer.name)}
          className="glass-card card-modern p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                {issuer.name}
              </h3>
              <p className="text-white/60 text-sm">{issuer.sector}</p>
            </div>
            <div className="bg-yellow-500/20 rounded-full p-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Latest Price</span>
              <span className="text-white font-semibold">{formatCurrency(issuer.latestPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Reports</span>
              <span className="text-white font-semibold">{issuer.totalReports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Latest</span>
              <span className="text-white font-semibold">Q{issuer.latestQuarter} {issuer.latestYear}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Avg PER</span>
              <span className="text-white font-semibold">{issuer.avgPER.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Avg ROE</span>
              <span className="text-white font-semibold">{issuer.avgROE.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Click to view all reports</span>
              <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}