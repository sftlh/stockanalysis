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
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No data available for visualization</p>
          <p className="text-sm">Add stock data to see charts and analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average PER</h3>
          <div className="text-3xl font-bold text-green-600">
            {averagePER.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Price-to-Earnings Ratio</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average ROE</h3>
          <div className="text-3xl font-bold text-blue-600">
            {averageROE.toFixed(2)}%
          </div>
          <p className="text-sm text-gray-500 mt-1">Return on Equity</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Market Cap</h3>
          <div className="text-3xl font-bold text-purple-600">
            {formatCurrencyCompact(totalMarketCap * 1000000)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Portfolio market value</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Debt-to-Equity Ratio Trends */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debt-to-Equity Ratio Trends</h3>
          <div className="h-112">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={derTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="period"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={xAxisInterval}
                  fontSize={12}
                />
                <YAxis label={{ value: 'DER (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'DER']}
                  labelFormatter={(label) => `Period: ${label}`}
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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Distribution</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROE vs PBV Analysis */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROE vs PBV Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="issuer" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="roe" fill="#059669" name="ROE (%)" />
                <Bar dataKey="pbv" fill="#10B981" name="PBV" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laba Bersih Growth */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Laba Bersih Growth</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quarterly Growth</span>
              <button
                onClick={() => setShowGrowth(!showGrowth)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  showGrowth ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showGrowth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">Absolute Value</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={showGrowth ? netProfitGrowthData : chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    showGrowth
                      ? `${value.toFixed(2)}%`
                      : formatCurrency(value),
                    showGrowth ? `${name} Growth (%)` : 'Net Profit'
                  ]}
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