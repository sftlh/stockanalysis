'use client'

import { formatCurrency } from '@/lib/currency'

import { useEffect, useState } from 'react'

interface StockData {
  id: number
  issuerName: string
  netProfit: number
  eps: number
  outstandingShares: number
  currentPrice: number
  totalEquity: number
  totalDebt: number
  dividends: number
  quarter: number
  year: number
  sector?: string
}

interface StockListProps {
  stocks?: StockData[]
}

export default function StockList({ stocks: propStocks }: StockListProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stockdata')
      if (response.ok) {
        const data = await response.json()
        setStocks(data)
      }
    } catch (error) {
      console.error('Failed to fetch stocks', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (propStocks) {
      setStocks(propStocks)
      setLoading(false)
      setCurrentPage(1) // Reset to first page when stocks change
    } else {
      fetchStocks()
    }
  }, [propStocks])

  const totalPages = Math.ceil(stocks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStocks = stocks.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="glass-card card-modern p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded-xl w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-white/10 rounded-xl"></div>
            <div className="h-6 bg-white/10 rounded-xl"></div>
            <div className="h-6 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card card-modern overflow-hidden">
      <div className="px-8 py-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">Stock Analysis Results</h3>
            <p className="text-white/70 text-lg">Comprehensive financial analysis and key metrics</p>
          </div>
          {stocks.length > 0 && (
            <div className="glass-card card-modern p-4 bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/30 rounded-lg p-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Latest Emiten</p>
                  <p className="text-lg font-bold text-white">
                    {stocks.sort((a, b) => b.id - a.id)[0]?.issuerName}
                  </p>
                  <p className="text-xs text-white/50">
                    Q{stocks.sort((a, b) => b.id - a.id)[0]?.quarter} {stocks.sort((a, b) => b.id - a.id)[0]?.year}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {stocks.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">No Stock Data Available</h4>
          <p className="text-white/60 text-lg">Add your first stock record to get started with analysis.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Issuer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Net Profit</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">EPS</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Outstanding Shares</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">PER</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Book Value</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">PBV</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">ROE</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">DER</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Quarter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/5">
                {paginatedStocks.map((stock) => {
                  const per = stock.eps !== 0 ? (stock.currentPrice / stock.eps).toFixed(2) : 'N/A'
                  const bookValue = stock.outstandingShares !== 0 ? (stock.totalEquity / stock.outstandingShares).toFixed(2) : 'N/A'
                  const pbv = bookValue !== 'N/A' && parseFloat(bookValue) !== 0 ? (stock.currentPrice / parseFloat(bookValue)).toFixed(2) : 'N/A'
                  const roe = stock.totalEquity !== 0 ? ((stock.netProfit / stock.totalEquity) * 100).toFixed(2) + '%' : 'N/A'
                  const der = stock.totalEquity !== 0 ? ((stock.totalDebt / stock.totalEquity) * 100).toFixed(2) + '%' : 'N/A'

                  return (
                    <tr key={stock.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-white">{stock.issuerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{stock.sector || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{formatCurrency(stock.netProfit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{formatCurrency(stock.eps)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{stock.outstandingShares.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{per}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{bookValue !== 'N/A' ? formatCurrency(parseFloat(bookValue)) : bookValue}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{pbv}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{roe}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{der}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">Q{stock.quarter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">{stock.year}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {stocks.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-8 px-8 py-6 bg-white/5 border-t border-white/10">
              <div className="text-sm text-white/70 font-medium">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, stocks.length)} of {stocks.length} results
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn-outline px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  First
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/70 font-medium">Page</span>
                  <span className="text-lg font-bold text-white bg-white/10 rounded-lg px-3 py-1">
                    {currentPage}
                  </span>
                  <span className="text-sm text-white/70 font-medium">of {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn-outline px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Latest
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}