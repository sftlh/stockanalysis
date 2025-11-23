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
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-green-200 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-green-200 rounded-xl w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-green-100 rounded-xl"></div>
            <div className="h-4 bg-green-100 rounded-xl"></div>
            <div className="h-4 bg-green-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-4 border-green-200 overflow-hidden transform hover:scale-105 transition-all duration-300">
      <div className="px-8 py-6 border-b-4 border-green-200 bg-linear-to-r from-green-500 to-emerald-500">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Stock Analysis Results</h3>
        <p className="text-green-100 text-lg drop-shadow">Comprehensive financial analysis and key metrics</p>
      </div>
      {stocks.length === 0 ? (
        <div className="p-8 text-center text-green-600">
          <p className="text-xl font-medium">No stock data available. Add your first record above.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-linear-to-r from-green-100 to-emerald-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Issuer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Net Profit</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">EPS</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">PER</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Book Value</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">PBV</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">ROE</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">DER</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">NPL</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Quarter</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-800 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {paginatedStocks.map((stock) => {
                  const per = stock.eps !== 0 ? (stock.currentPrice / stock.eps).toFixed(2) : 'N/A'
                  const bookValue = stock.outstandingShares !== 0 ? (stock.totalEquity / stock.outstandingShares).toFixed(2) : 'N/A'
                  const pbv = bookValue !== 'N/A' && parseFloat(bookValue) !== 0 ? (stock.currentPrice / parseFloat(bookValue)).toFixed(2) : 'N/A'
                  const roe = stock.totalEquity !== 0 ? ((stock.netProfit / stock.totalEquity) * 100).toFixed(2) + '%' : 'N/A'
                  const der = stock.totalEquity !== 0 ? ((stock.totalDebt / stock.totalEquity) * 100).toFixed(2) + '%' : 'N/A'
                  const npl = stock.totalDebt !== 0 ? ((stock.netProfit / stock.totalDebt) * 100).toFixed(2) + '%' : 'N/A'

                  return (
                    <tr key={stock.id} className="hover:bg-green-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900">{stock.issuerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{stock.sector || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{formatCurrency(stock.netProfit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{formatCurrency(stock.eps)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{per}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{bookValue !== 'N/A' ? formatCurrency(parseFloat(bookValue)) : bookValue}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{pbv}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{roe}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{der}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{npl}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">Q{stock.quarter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-green-700 font-medium">{stock.year}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {stocks.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-6 py-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 font-medium">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, stocks.length)} of {stocks.length} results
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="text-sm text-green-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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