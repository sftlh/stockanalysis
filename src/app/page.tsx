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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
            <div className="absolute inset-2 rounded-full border-4 border-white/20 border-t-transparent animate-spin animation-delay-600 opacity-50"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg animate-pulse">Stock Analysis Pro</h2>
            <p className="text-white/80 text-lg animate-pulse animation-delay-300">Professional financial data management</p>
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
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold gradient-text mb-2">Stock Analysis Pro</h1>
            <p className="text-white/80 text-lg">Professional stock data management</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 fade-in-up">
              Professional <span className="gradient-text">Stock Analysis</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto fade-in-up animation-delay-200">
              Advanced financial data management with intelligent analytics, sector comparisons, and real-time insights for professional investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up animation-delay-300">
              <button
                onClick={() => router.push('/add-stock')}
                className="btn-primary"
              >
                Add Stock Data
              </button>
              <button
                onClick={() => router.push('/sector-comparison')}
                className="btn-secondary"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold gradient-text">Stock Analysis Pro</h1>
              <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/80 font-medium">Live Data</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-white font-medium">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
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
      </div>

      {/* Dashboard Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="glass-card card-modern p-8 fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60 uppercase tracking-wide">Total Stocks</p>
                <div className="text-4xl font-bold text-white mt-2">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-white/20 h-10 w-16 rounded"></div>
                  ) : (
                    filteredStocks.length
                  )}
                </div>
                <p className="text-xs text-white/50 mt-2">Active positions</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 pulse-glow">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card card-modern p-8 fade-in-up animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60 uppercase tracking-wide">Avg EPS</p>
                <div className="text-4xl font-bold text-white mt-2">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-white/20 h-10 w-24 rounded"></div>
                  ) : (
                    filteredStocks.length > 0 ? formatCurrency(filteredStocks.reduce((sum, stock) => sum + stock.eps, 0) / filteredStocks.length) : 'Rp0'
                  )}
                </div>
                <p className="text-xs text-white/50 mt-2">Earnings per share</p>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card card-modern p-8 fade-in-up animation-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60 uppercase tracking-wide">High ROE Emiten</p>
                <div className="text-4xl font-bold text-white mt-2">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-white/20 h-10 w-16 rounded"></div>
                  ) : (
                    filteredStocks.filter(stock => stock.totalEquity !== 0 && (stock.netProfit / stock.totalEquity) * 100 > 20).length
                  )}
                </div>
                <p className="text-xs text-green-400 mt-2 font-medium">ROE {'>'} 20%</p>
              </div>
              <div className="bg-green-500/20 rounded-xl p-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card card-modern p-8 fade-in-up animation-delay-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60 uppercase tracking-wide">Low DER Emiten</p>
                <div className="text-4xl font-bold text-white mt-2">
                  {stocksLoading ? (
                    <div className="animate-pulse bg-white/20 h-10 w-16 rounded"></div>
                  ) : (
                    filteredStocks.filter(stock => stock.totalEquity !== 0 && (stock.totalDebt / stock.totalEquity) < 0.5).length
                  )}
                </div>
                <p className="text-xs text-blue-400 mt-2 font-medium">DER {'<'} 0.5</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card card-modern p-8 mb-16 fade-in-up animation-delay-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Quick Actions</h3>
              <p className="text-white/70">Manage your portfolio efficiently</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <span className="text-sm text-white/80 font-medium">Portfolio Tools</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/add-stock')}
              className="btn-primary flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Stock Data
            </button>
            <button
              onClick={() => router.push('/sector-comparison')}
              className="btn-secondary flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Sector Comparison
            </button>
            <button
              onClick={() => router.push('/bookmarks')}
              className="btn-secondary flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              My Bookmarks
            </button>
            <button
              onClick={() => router.push('/edit-stock')}
              className="btn-secondary flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6M6 12h12M6 19h12" />
              </svg>
              Edit Stocks
            </button>
          </div>
        </div>

        {/* Stock Portfolio Section */}
        <div className="glass-card card-modern overflow-hidden fade-in-up animation-delay-500">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Stock Portfolio</h2>
                <p className="text-white/70 text-lg">Your investment holdings and performance analytics</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/60 bg-white/10 rounded-xl px-4 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Last updated: Just now</span>
              </div>
            </div>
          </div>

          {/* Data Visualization */}
          <div className="p-8 border-b border-white/10">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading Analytics</h3>
                  <p className="text-white/70">Preparing your financial insights...</p>
                </div>
              </div>
            ) : (
              <StockCharts stocks={filteredStocks} />
            )}
          </div>

          {/* Advanced Filters */}
          <div className="p-8 border-b border-white/10">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse bg-white/20 h-16 w-64 rounded-xl"></div>
              </div>
            ) : (
              <StockFilters stocks={allStocks} onFilteredStocksChange={setFilteredStocks} />
            )}
          </div>

          {/* Stock List */}
          <div className="p-8">
            {stocksLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Loading Portfolio</h3>
                  <p className="text-white/70 text-lg">Fetching your investment data...</p>
                </div>
              </div>
            ) : (
              <StockList stocks={filteredStocks} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold gradient-text mb-4">Stock Analysis Pro</h3>
            <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
              Professional financial data management platform with advanced analytics, sector comparisons, and intelligent insights for modern investors.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center gap-2 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Secure & Reliable</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">Enterprise Security</span>
              </div>
            </div>
            <p className="text-white/50 text-sm">
              © 2025 Mumbul Dev. Built with NextJs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
