'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '@/lib/currency'

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

interface StockChartsProps {
  stocks: StockData[]
}

const COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22']

export default function StockCharts({ stocks }: StockChartsProps) {
  const [showGrowth, setShowGrowth] = useState(false)
  const chartData = useMemo(() => {
    if (stocks.length === 0) return []

    return stocks
      .sort((a: StockData, b: StockData) => {
        if (a.year !== b.year) return a.year - b.year
        return a.quarter - b.quarter
      })
      .map((stock: StockData) => ({
        period: `Q${stock.quarter} ${stock.year}`,
        issuer: stock.issuerName,
        per: stock.eps !== 0 ? parseFloat((stock.currentPrice / stock.eps).toFixed(2)) : 0,
        pbv: stock.outstandingShares !== 0 && stock.totalEquity !== 0 ?
          parseFloat((stock.currentPrice / (stock.totalEquity / stock.outstandingShares)).toFixed(2)) : 0,
        roe: stock.totalEquity !== 0 ? parseFloat(((stock.netProfit / stock.totalEquity) * 100).toFixed(2)) : 0,
        der: stock.totalEquity !== 0 ? parseFloat(((stock.totalDebt / stock.totalEquity) * 100).toFixed(2)) : 0,
        price: stock.currentPrice,
        netProfit: stock.netProfit
      }))
  }, [stocks])

  const netProfitGrowthData = useMemo(() => {
    if (stocks.length === 0) return []

    // Group stocks by issuer
    const issuerGroups: { [key: string]: StockData[] } = {}
    stocks.forEach((stock) => {
      if (!issuerGroups[stock.issuerName]) {
        issuerGroups[stock.issuerName] = []
      }
      issuerGroups[stock.issuerName].push(stock)
    })

    // Create a unified timeline for all issuers
    const allPeriods = new Set<string>()
    Object.values(issuerGroups).forEach(issuerStocks => {
      issuerStocks.forEach(stock => {
        allPeriods.add(`Q${stock.quarter} ${stock.year}`)
      })
    })

    const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
      const aParts = a.split(' ')
      const bParts = b.split(' ')
      const aYear = parseInt(aParts[1])
      const bYear = parseInt(bParts[1])
      if (aYear !== bYear) return aYear - bYear
      const aQuarter = parseInt(aParts[0].substring(1))
      const bQuarter = parseInt(bParts[0].substring(1))
      return aQuarter - bQuarter
    })

    // Create data points for each period, with growth for each issuer
    const growthData: { period: string; [key: string]: string | number }[] = []

    sortedPeriods.forEach(period => {
      const dataPoint: { period: string; [key: string]: string | number } = { period }

      Object.entries(issuerGroups).forEach(([issuer, issuerStocks]) => {
        // Find the stock for this period and issuer
        const stockForPeriod = issuerStocks.find(stock =>
          `Q${stock.quarter} ${stock.year}` === period
        )

        if (stockForPeriod) {
          // Find previous period for this issuer
          const periodIndex = sortedPeriods.indexOf(period)
          let growth = 0

          if (periodIndex > 0) {
            const prevPeriod = sortedPeriods[periodIndex - 1]
            const prevStock = issuerStocks.find(stock =>
              `Q${stock.quarter} ${stock.year}` === prevPeriod
            )

            if (prevStock && prevStock.netProfit !== 0) {
              growth = ((stockForPeriod.netProfit - prevStock.netProfit) / Math.abs(prevStock.netProfit)) * 100
            }
          }

          dataPoint[`${issuer}_growth`] = parseFloat(growth.toFixed(2))
          dataPoint[`${issuer}_netProfit`] = stockForPeriod.netProfit
        }
      })

      growthData.push(dataPoint)
    })

    return growthData
  }, [stocks])

  // Get unique issuers for chart lines (limited to 10 for cleaner display)
  const uniqueIssuers = useMemo(() => {
    const issuerCount: { [key: string]: number } = {}
    stocks.forEach((stock: StockData) => {
      issuerCount[stock.issuerName] = (issuerCount[stock.issuerName] || 0) + 1
    })
    // Sort by number of data points (descending), then alphabetically, take first 10
    return Object.entries(issuerCount)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([issuer]) => issuer)
  }, [stocks])

  const sectorData = useMemo(() => {
    if (stocks.length === 0) return []

    const sectorCount: { [key: string]: number } = {}
    stocks.forEach((stock: StockData) => {
      const sector = stock.sector || 'Other'
      sectorCount[sector] = (sectorCount[sector] || 0) + 1
    })

    return Object.entries(sectorCount).map(([sector, count]) => ({
      name: sector,
      value: count
    }))
  }, [stocks])

  const averagePER = useMemo(() => {
    if (stocks.length === 0) return 0
    return stocks.reduce((sum: number, stock: StockData) =>
      sum + (stock.eps !== 0 ? stock.currentPrice / stock.eps : 0), 0) / stocks.length
  }, [stocks])

  const averageROE = useMemo(() => {
    if (stocks.length === 0) return 0
    return stocks.reduce((sum: number, stock: StockData) =>
      sum + (stock.totalEquity !== 0 ? (stock.netProfit / stock.totalEquity) * 100 : 0), 0) / stocks.length
  }, [stocks])

  const totalMarketCap = useMemo(() => {
    if (stocks.length === 0) return 0
    return stocks.reduce((sum: number, stock: StockData) =>
      sum + (stock.currentPrice * stock.outstandingShares), 0) / 1000000
  }, [stocks])

  const derTrendsData = useMemo(() => {
    if (stocks.length === 0) return []

    // Group stocks by issuer
    const issuerGroups: { [key: string]: StockData[] } = {}
    stocks.forEach((stock) => {
      if (!issuerGroups[stock.issuerName]) {
        issuerGroups[stock.issuerName] = []
      }
      issuerGroups[stock.issuerName].push(stock)
    })

    // Create a unified timeline for all issuers
    const allPeriods = new Set<string>()
    Object.values(issuerGroups).forEach(issuerStocks => {
      issuerStocks.forEach(stock => {
        allPeriods.add(`Q${stock.quarter} ${stock.year}`)
      })
    })

    const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
      const aParts = a.split(' ')
      const bParts = b.split(' ')
      const aYear = parseInt(aParts[1])
      const bYear = parseInt(bParts[1])
      if (aYear !== bYear) return aYear - bYear
      const aQuarter = parseInt(aParts[0].substring(1))
      const bQuarter = parseInt(bParts[0].substring(1))
      return aQuarter - bQuarter
    })

    // Create data points for each period, with DER for each issuer
    const derData: { period: string; [key: string]: string | number }[] = []

    sortedPeriods.forEach(period => {
      const dataPoint: { period: string; [key: string]: string | number } = { period }

      Object.entries(issuerGroups).forEach(([issuer, issuerStocks]) => {
        const stockForPeriod = issuerStocks.find(stock =>
          `Q${stock.quarter} ${stock.year}` === period
        )

        if (stockForPeriod) {
          const der = stockForPeriod.totalEquity !== 0 ?
            parseFloat(((stockForPeriod.totalDebt / stockForPeriod.totalEquity) * 100).toFixed(2)) : 0
          dataPoint[`${issuer}_der`] = der
        }
      })

      derData.push(dataPoint)
    })

    return derData
  }, [stocks])

  // Calculate X-axis interval for cleaner labels
  const xAxisInterval = useMemo(() => {
    return Math.max(1, Math.floor(derTrendsData.length / 8))
  }, [derTrendsData.length])

  if (stocks.length === 0) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="mb-6">
          <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-2">No Data Available for Visualization</h4>
        <p className="text-white/60 text-lg">Add stock data to see charts and analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card card-modern p-8 fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Average PER</h3>
              <p className="text-white/70">Price-to-Earnings Ratio</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {averagePER.toFixed(2)}
          </div>
        </div>

        <div className="glass-card card-modern p-8 fade-in-up animation-delay-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Average ROE</h3>
              <p className="text-white/70">Return on Equity</p>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {averageROE.toFixed(2)}%
          </div>
        </div>

        <div className="glass-card card-modern p-8 fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Total Market Cap</h3>
              <p className="text-white/70">Portfolio market value</p>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {formatCurrencyCompact(totalMarketCap * 1000000)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Debt-to-Equity Ratio Trends */}
        <div className="glass-card card-modern p-8 fade-in-up animation-delay-300">
          <h3 className="text-2xl font-bold text-white mb-6">Debt-to-Equity Ratio Trends</h3>
          <div className="h-112">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={derTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="period"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  fontSize={12}
                  stroke="#9CA3AF"
                />
                <YAxis label={{ value: 'DER (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'DER']}
                  labelFormatter={(label) => `Period: ${label}`}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                {uniqueIssuers.map((issuer, index) => (
                  <Line
                    key={issuer}
                    type="monotone"
                    dataKey={`${issuer}_der`}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                    name={issuer}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="glass-card card-modern p-8 fade-in-up animation-delay-400">
          <h3 className="text-2xl font-bold text-white mb-6">Sector Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROE vs PBV Analysis */}
        <div className="glass-card card-modern p-8 fade-in-up animation-delay-500">
          <h3 className="text-2xl font-bold text-white mb-6">ROE vs PBV Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="issuer" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="roe" fill="#059669" name="ROE (%)" />
                <Bar dataKey="pbv" fill="#10B981" name="PBV" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laba Bersih Growth */}
        <div className="glass-card card-modern p-8 fade-in-up animation-delay-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Laba Bersih Growth</h3>
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-2">
              <span className={`text-sm font-medium transition-colors ${!showGrowth ? 'text-white' : 'text-white/60'}`}>Quarterly Growth</span>
              <button
                onClick={() => setShowGrowth(!showGrowth)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  showGrowth ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    showGrowth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${showGrowth ? 'text-white' : 'text-white/60'}`}>Absolute Value</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={showGrowth ? netProfitGrowthData : chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    showGrowth
                      ? `${value.toFixed(2)}%`
                      : formatCurrency(value),
                    showGrowth ? `${name} Growth (%)` : 'Net Profit'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                {showGrowth ? (
                  // Show separate lines for each issuer's growth
                  uniqueIssuers.map((issuer, index) => (
                    <Line
                      key={issuer}
                      type="monotone"
                      dataKey={`${issuer}_growth`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                      name={`${issuer} Growth (%)`}
                      connectNulls={false}
                    />
                  ))
                ) : (
                  // Show single line for absolute values
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                    name="Net Profit"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}