'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StockList from '@/components/StockList'
import StockCharts from '@/components/StockCharts'
import StockFilters from '@/components/StockFilters'
import LoginForm from '@/components/LoginForm'
import { formatCurrency } from '@/lib/currency'

interface User {
  id: number
  email: string
  name?: string
}

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stocksLoading, setStocksLoading] = useState(false)
  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchStocks = async () => {
      setStocksLoading(true)
      try {
        const response = await fetch('/api/stockdata')
          const data: StockData[] = await response.json()
          setAllStocks(data)
          setFilteredStocks(data)
      } catch (error) {
        console.error('Failed to fetch stocks', error)
      } finally {
        setStocksLoading(false)
      }
    }

    if (user) {
      fetchStocks()
    }
  }, [user])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-300 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
            <div className="absolute inset-2 rounded-full border-4 border-emerald-200 border-t-transparent animate-spin animation-delay-600 opacity-50"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg animate-pulse">Loading Stock Analysis Pro</h2>
            <p className="text-green-100 text-lg animate-pulse animation-delay-300">Preparing your financial dashboard...</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Stock Analysis Pro</h1>
            <p className="text-green-100 text-lg">Professional stock data management</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-linear-to-r from-green-600 to-emerald-600 shadow-xl border-b-4 border-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Stock Analysis Pro</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2 backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-sm font-medium hidden sm:block">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Stocks</p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    filteredStocks.length
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Active positions</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">High NPL Emiten</p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    filteredStocks.filter(stock => stock.totalDebt !== 0 && (stock.netProfit / stock.totalDebt) * 100 > 20).length
                  )}
                </div>
                <p className="text-xs text-green-600 mt-1 font-medium">NPL {'>'} 20%</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg EPS</p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    filteredStocks.length > 0 ? formatCurrency(filteredStocks.reduce((sum, stock) => sum + stock.eps, 0) / filteredStocks.length) : 'Rp0'
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Earnings per share</p>
              </div>
              <div className="bg-purple-50 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">High ROE Emiten</p>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                  ) : (
                    filteredStocks.filter(stock => stock.totalEquity !== 0 && (stock.netProfit / stock.totalEquity) * 100 > 20).length
                  )}
                </div>
                <p className="text-xs text-green-600 mt-1 font-medium">ROE {'>'} 20%</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <span className="text-sm text-gray-500">Manage your portfolio</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/add-stock')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Stock Data
            </button>
            <button
              onClick={() => router.push('/sector-comparison')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Sector Comparison
            </button>
            <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
          </div>
        </div>

        {/* Stock Portfolio Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Stock Portfolio</h2>
                <p className="text-sm text-gray-600 mt-1">Your investment holdings and performance</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: Just now
              </div>
            </div>
          </div>

          {/* Data Visualization */}
          <div className="p-6 border-b border-gray-200">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading charts...</p>
                </div>
              </div>
            ) : (
              <StockCharts stocks={filteredStocks} />
            )}
          </div>

          {/* Advanced Filters */}
          <div className="p-6 border-b border-gray-200">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse bg-gray-200 h-12 w-48 rounded"></div>
              </div>
            ) : (
              <StockFilters stocks={allStocks} onFilteredStocksChange={setFilteredStocks} />
            )}
          </div>

          {/* Stock List */}
          <div className="p-6">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading your portfolio data...</p>
                </div>
              </div>
            ) : (
              <StockList stocks={filteredStocks} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-linear-to-r from-green-700 to-emerald-700 mt-20 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-white text-lg font-medium drop-shadow">
            © 2025 Stock Analysis Pro. Professional financial data management.
          </p>
        </div>
      </footer>
    </div>
  )
}
