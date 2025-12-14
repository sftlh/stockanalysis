'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

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

export default function IssuerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const issuerName = decodeURIComponent(params.issuer as string);

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    const fetchIssuerStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stockdata');
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const allStocks: StockData[] = await response.json();

        // Filter stocks for this specific issuer
        const issuerStocks = allStocks.filter(stock =>
          stock.issuerName.toLowerCase() === issuerName.toLowerCase()
        );

        setStocks(issuerStocks);
      } catch (err) {
        console.error('Error fetching issuer stocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load issuer data');
      } finally {
        setLoading(false);
      }
    };

    if (issuerName) {
      fetchIssuerStocks();
    }
  }, [issuerName]);

  // Load notes from localStorage
  useEffect(() => {
    if (issuerName) {
      const savedNotes = localStorage.getItem(`issuer-notes-${issuerName}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [issuerName]);

  // Prepare chart data
  const chartData = stocks
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    })
    .map(stock => {
      const per = stock.eps !== 0 ? stock.currentPrice / stock.eps : null;
      const roe = stock.totalEquity !== 0 ? (stock.netProfit / stock.totalEquity) * 100 : null;
      const bookValue = stock.outstandingShares !== 0 ? stock.totalEquity / stock.outstandingShares : null;
      const pbv = bookValue && bookValue !== 0 ? stock.currentPrice / bookValue : null;

      return {
        period: `Q${stock.quarter} ${stock.year}`,
        price: stock.currentPrice,
        eps: stock.eps,
        netProfit: stock.netProfit,
        per: per || 0,
        roe: roe || 0,
        pbv: pbv || 0,
        quarter: stock.quarter,
        year: stock.year
      };
    });

  // Calculate growth rates and analysis
  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const latestStock = stocks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
  })[0];

  const previousStock = stocks.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.quarter - a.quarter;
  })[1];

  const quarterlyGrowth = previousStock ? {
    price: calculateGrowthRate(latestStock.currentPrice, previousStock.currentPrice),
    eps: calculateGrowthRate(latestStock.eps, previousStock.eps),
    netProfit: calculateGrowthRate(latestStock.netProfit, previousStock.netProfit)
  } : null;

  // Save notes to localStorage
  const saveNotes = (newNotes: string) => {
    setNotes(newNotes);
    localStorage.setItem(`issuer-notes-${issuerName}`, newNotes);
    setIsEditingNotes(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-4">Loading {issuerName}</h2>
          <p className="text-white/80">Fetching issuer reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Error Loading Data</h1>
          <p className="text-white/70 mb-8">{error}</p>
          <button
            onClick={() => router.push('/bookmarks')}
            className="btn-secondary"
          >
            Back to Bookmarks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/bookmarks')}
                className="flex items-center gap-2 text-white/70 hover:text-white mr-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Bookmarks</span>
              </button>
              <div className="h-6 w-px bg-white/20 mr-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-white">{issuerName}</h1>
                <p className="text-xs text-white/60">{stocks.length} Report{stocks.length !== 1 ? 's' : ''}</p>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl mb-6 pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-3">{issuerName}</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Complete financial reports and analysis for {issuerName}
            </p>
          </div>
        </div>

        {stocks.length === 0 ? (
          <div className="glass-card card-modern p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/20 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
            <p className="text-white/70 mb-6">No financial reports available for {issuerName}</p>
            <button
              onClick={() => router.push('/bookmarks')}
              className="btn-secondary"
            >
              Back to Bookmarks
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Charts */}
            <div className="glass-card card-modern p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Performance Charts</h2>
                <div className="bg-blue-500/20 rounded-xl px-4 py-2">
                  <span className="text-sm text-blue-300 font-medium">Trend Analysis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Price Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Stock Price Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Price']}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        fill="url(#priceGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* EPS Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">EPS Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'EPS']}
                      />
                      <Line
                        type="monotone"
                        dataKey="eps"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Net Profit Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Net Profit Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Net Profit']}
                      />
                      <Bar dataKey="netProfit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ROE Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">ROE Trend (%)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'ROE']}
                      />
                      <Line
                        type="monotone"
                        dataKey="roe"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Investment Analysis */}
            <div className="glass-card card-modern p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Investment Analysis</h2>
                <div className="bg-green-500/20 rounded-xl px-4 py-2">
                  <span className="text-sm text-green-300 font-medium">Insights</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Quarterly Growth</h3>
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  {quarterlyGrowth ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Price Growth:</span>
                        <span className={`font-semibold ${quarterlyGrowth.price >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {quarterlyGrowth.price >= 0 ? '+' : ''}{quarterlyGrowth.price.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">EPS Growth:</span>
                        <span className={`font-semibold ${quarterlyGrowth.eps >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {quarterlyGrowth.eps >= 0 ? '+' : ''}{quarterlyGrowth.eps.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Profit Growth:</span>
                        <span className={`font-semibold ${quarterlyGrowth.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {quarterlyGrowth.netProfit >= 0 ? '+' : ''}{quarterlyGrowth.netProfit.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60">Need at least 2 quarters of data</p>
                  )}
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Valuation Metrics</h3>
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Current PER:</span>
                      <span className="font-semibold text-white">
                        {latestStock.eps !== 0 ? (latestStock.currentPrice / latestStock.eps).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Current PBV:</span>
                      <span className="font-semibold text-white">
                        {latestStock.outstandingShares !== 0 && latestStock.totalEquity !== 0 ?
                          (latestStock.currentPrice / (latestStock.totalEquity / latestStock.outstandingShares)).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">DER Ratio:</span>
                      <span className="font-semibold text-white">
                        {latestStock.totalEquity !== 0 ? (latestStock.totalDebt / latestStock.totalEquity).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">ROE Health:</span>
                      <span className={`font-semibold ${
                        latestStock.totalEquity !== 0 && (latestStock.netProfit / latestStock.totalEquity) * 100 > 15
                          ? 'text-green-400' : (latestStock.netProfit / latestStock.totalEquity) * 100 > 5
                          ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {latestStock.totalEquity !== 0 ? `${((latestStock.netProfit / latestStock.totalEquity) * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Debt Level:</span>
                      <span className={`font-semibold ${
                        latestStock.totalEquity !== 0 && (latestStock.totalDebt / latestStock.totalEquity) < 1
                          ? 'text-green-400' : (latestStock.totalDebt / latestStock.totalEquity) < 2
                          ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {latestStock.totalEquity !== 0 ? `${(latestStock.totalDebt / latestStock.totalEquity).toFixed(2)}x` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Trend:</span>
                      <span className={`font-semibold ${
                        quarterlyGrowth && quarterlyGrowth.netProfit > 0 ? 'text-green-400' :
                        quarterlyGrowth && quarterlyGrowth.netProfit < 0 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {quarterlyGrowth ? (quarterlyGrowth.netProfit > 0 ? 'Improving' : 'Declining') : 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Insights */}
              <div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Investment Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-300 mb-2">Strengths</h4>
                    <ul className="text-white/80 space-y-1">
                      {latestStock.totalEquity !== 0 && (latestStock.netProfit / latestStock.totalEquity) * 100 > 15 && (
                        <li>• Strong ROE indicates efficient profit generation</li>
                      )}
                      {quarterlyGrowth && quarterlyGrowth.netProfit > 10 && (
                        <li>• Consistent profit growth shows business momentum</li>
                      )}
                      {latestStock.totalEquity !== 0 && (latestStock.totalDebt / latestStock.totalEquity) < 1 && (
                        <li>• Conservative debt levels provide financial stability</li>
                      )}
                      {latestStock.eps > 0 && (
                        <li>• Positive EPS indicates earnings capability</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-300 mb-2">Risks & Considerations</h4>
                    <ul className="text-white/80 space-y-1">
                      {latestStock.totalEquity !== 0 && (latestStock.netProfit / latestStock.totalEquity) * 100 < 5 && (
                        <li>• Low ROE may indicate profitability concerns</li>
                      )}
                      {latestStock.totalEquity !== 0 && (latestStock.totalDebt / latestStock.totalEquity) > 2 && (
                        <li>• High debt levels increase financial risk</li>
                      )}
                      {quarterlyGrowth && quarterlyGrowth.netProfit < -10 && (
                        <li>• Declining profits require careful monitoring</li>
                      )}
                      {latestStock.eps !== 0 && (latestStock.currentPrice / latestStock.eps) > 25 && (
                        <li>• High PER may indicate overvaluation</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Notes */}
            <div className="glass-card card-modern p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Investment Notes</h2>
                <div className="bg-purple-500/20 rounded-xl px-4 py-2">
                  <span className="text-sm text-purple-300 font-medium">Personal</span>
                </div>
              </div>

              {isEditingNotes ? (
                <div className="space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your investment thesis, risk assessment, or any notes about this stock..."
                    className="w-full h-32 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => saveNotes(notes)}
                      className="btn-primary"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes ? (
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-white/90 whitespace-pre-wrap">{notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <p className="text-white/60 mb-4">No notes yet. Add your investment thoughts and analysis.</p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="btn-secondary"
                  >
                    {notes ? 'Edit Notes' : 'Add Notes'}
                  </button>
                </div>
              )}
            </div>

            {/* Detailed Reports */}
            <div className="glass-card card-modern p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detailed Reports</h2>
                <div className="bg-gray-500/20 rounded-xl px-4 py-2">
                  <span className="text-sm text-gray-300 font-medium">Historical Data</span>
                </div>
              </div>

              {stocks
                .sort((a, b) => {
                  // Sort by year descending, then quarter descending
                  if (a.year !== b.year) return b.year - a.year;
                  return b.quarter - a.quarter;
                })
                .map((stock) => {
                  const per = stock.eps !== 0 ? (stock.currentPrice / stock.eps).toFixed(2) : 'N/A';
                  const bookValue = stock.outstandingShares !== 0 ? (stock.totalEquity / stock.outstandingShares).toFixed(2) : 'N/A';
                  const pbv = bookValue !== 'N/A' && parseFloat(bookValue) !== 0 ? (stock.currentPrice / parseFloat(bookValue)).toFixed(2) : 'N/A';
                  const roe = stock.totalEquity !== 0 ? ((stock.netProfit / stock.totalEquity) * 100).toFixed(2) : 'N/A';
                  const der = stock.totalEquity !== 0 ? (stock.totalDebt / stock.totalEquity).toFixed(2) : 'N/A';

                  return (
                    <div key={stock.id} className="glass-card card-modern p-8 mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Q{stock.quarter} {stock.year} Report
                          </h3>
                          <p className="text-white/70">{stock.sector}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold gradient-text mb-1">
                            {formatCurrency(stock.currentPrice)}
                          </div>
                          <div className="text-sm text-white/60">Current Price</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">Net Profit</div>
                          <div className="text-xl font-semibold text-white">
                            {formatCurrency(stock.netProfit)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">EPS</div>
                          <div className="text-xl font-semibold text-white">
                            {formatCurrency(stock.eps)}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">Outstanding Shares</div>
                          <div className="text-xl font-semibold text-white">
                            {stock.outstandingShares.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">PER</div>
                          <div className="text-xl font-semibold text-white">{per}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">Book Value</div>
                          <div className="text-xl font-semibold text-white">
                            {bookValue !== 'N/A' ? formatCurrency(parseFloat(bookValue)) : bookValue}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">PBV</div>
                          <div className="text-xl font-semibold text-white">{pbv}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">ROE</div>
                          <div className="text-xl font-semibold text-white">{roe}%</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="text-sm text-white/60 mb-1">DER</div>
                          <div className="text-xl font-semibold text-white">{der}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}