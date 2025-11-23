'use client'

import { useState, useEffect, useMemo } from 'react'

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

interface StockFiltersProps {
  stocks: StockData[]
  onFilteredStocksChange: (filteredStocks: StockData[]) => void
}

export default function StockFilters({ stocks, onFilteredStocksChange }: StockFiltersProps) {
  const [filters, setFilters] = useState({
    issuerName: '',
    sector: '',
    year: '',
    quarter: '',
    minPER: '',
    maxPER: '',
    minROE: '',
    maxROE: '',
    minPBV: '',
    maxPBV: '',
    minDER: '',
    maxDER: ''
  })

  const [showIssuerDropdown, setShowIssuerDropdown] = useState(false)

  const availableSectors = useMemo(() => {
    return [...new Set(stocks.map(stock => stock.sector).filter(Boolean))] as string[]
  }, [stocks])

  const availableYears = useMemo(() => {
    return [...new Set(stocks.map(stock => stock.year))].sort((a, b) => b - a)
  }, [stocks])

  const availableIssuers = useMemo(() => {
    return [...new Set(stocks.map(stock => stock.issuerName))].sort()
  }, [stocks])

  const filteredIssuers = useMemo(() => {
    if (!filters.issuerName) return []
    return availableIssuers.filter(issuer =>
      issuer.toLowerCase().startsWith(filters.issuerName.toLowerCase())
    ).slice(0, 10) // Limit to 10 suggestions
  }, [availableIssuers, filters.issuerName])

  useEffect(() => {
    // Apply filters whenever filters change
    let filtered = [...stocks]

    // Issuer name filter
    if (filters.issuerName) {
      filtered = filtered.filter(stock =>
        stock.issuerName.toLowerCase().startsWith(filters.issuerName.toLowerCase())
      )
    }

    // Sector filter
    if (filters.sector) {
      filtered = filtered.filter(stock => stock.sector === filters.sector)
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(stock => stock.year === parseInt(filters.year))
    }

    // Quarter filter
    if (filters.quarter) {
      filtered = filtered.filter(stock => stock.quarter === parseInt(filters.quarter))
    }

    // PER filter
    if (filters.minPER || filters.maxPER) {
      filtered = filtered.filter(stock => {
        if (stock.eps === 0) return false
        const per = stock.currentPrice / stock.eps
        const minPER = filters.minPER ? parseFloat(filters.minPER) : -Infinity
        const maxPER = filters.maxPER ? parseFloat(filters.maxPER) : Infinity
        return per >= minPER && per <= maxPER
      })
    }

    // ROE filter
    if (filters.minROE || filters.maxROE) {
      filtered = filtered.filter(stock => {
        if (stock.totalEquity === 0) return false
        const roe = (stock.netProfit / stock.totalEquity) * 100
        const minROE = filters.minROE ? parseFloat(filters.minROE) : -Infinity
        const maxROE = filters.maxROE ? parseFloat(filters.maxROE) : Infinity
        return roe >= minROE && roe <= maxROE
      })
    }

    // PBV filter
    if (filters.minPBV || filters.maxPBV) {
      filtered = filtered.filter(stock => {
        if (stock.outstandingShares === 0 || stock.totalEquity === 0) return false
        const bookValue = stock.totalEquity / stock.outstandingShares
        if (bookValue === 0) return false
        const pbv = stock.currentPrice / bookValue
        const minPBV = filters.minPBV ? parseFloat(filters.minPBV) : -Infinity
        const maxPBV = filters.maxPBV ? parseFloat(filters.maxPBV) : Infinity
        return pbv >= minPBV && pbv <= maxPBV
      })
    }

    // DER filter
    if (filters.minDER || filters.maxDER) {
      filtered = filtered.filter(stock => {
        if (stock.totalEquity === 0) return false
        const der = (stock.totalDebt / stock.totalEquity) * 100
        const minDER = filters.minDER ? parseFloat(filters.minDER) : -Infinity
        const maxDER = filters.maxDER ? parseFloat(filters.maxDER) : Infinity
        return der >= minDER && der <= maxDER
      })
    }

    onFilteredStocksChange(filtered)
  }, [filters, stocks, onFilteredStocksChange])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      issuerName: '',
      sector: '',
      year: '',
      quarter: '',
      minPER: '',
      maxPER: '',
      minROE: '',
      maxROE: '',
      minPBV: '',
      maxPBV: '',
      minDER: '',
      maxDER: ''
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Basic Filters */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Issuer Name</label>
          <input
            type="text"
            value={filters.issuerName}
            onChange={(e) => {
              handleFilterChange('issuerName', e.target.value)
              setShowIssuerDropdown(true)
            }}
            onFocus={() => setShowIssuerDropdown(true)}
            onBlur={() => setTimeout(() => setShowIssuerDropdown(false), 200)}
            placeholder="Type to search issuers..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {showIssuerDropdown && filteredIssuers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredIssuers.map((issuer) => (
                <div
                  key={issuer}
                  onClick={() => {
                    handleFilterChange('issuerName', issuer)
                    setShowIssuerDropdown(false)
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {issuer}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Sectors</option>
            {availableSectors.map((sector: string) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Years</option>
            {availableYears.map((year: number) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
          <select
            value={filters.quarter}
            onChange={(e) => handleFilterChange('quarter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Quarters</option>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </div>

        {/* PER Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PER Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minPER}
              onChange={(e) => handleFilterChange('minPER', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxPER}
              onChange={(e) => handleFilterChange('maxPER', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        {/* ROE Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ROE Range (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minROE}
              onChange={(e) => handleFilterChange('minROE', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxROE}
              onChange={(e) => handleFilterChange('maxROE', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        {/* PBV Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PBV Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minPBV}
              onChange={(e) => handleFilterChange('minPBV', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxPBV}
              onChange={(e) => handleFilterChange('maxPBV', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        {/* DER Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">DER Range (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minDER}
              onChange={(e) => handleFilterChange('minDER', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxDER}
              onChange={(e) => handleFilterChange('maxDER', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.issuerName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Issuer: {filters.issuerName}
              </span>
            )}
            {filters.sector && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sector: {filters.sector}
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Year: {filters.year}
              </span>
            )}
            {filters.quarter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Quarter: Q{filters.quarter}
              </span>
            )}
            {(filters.minPER || filters.maxPER) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                PER: {filters.minPER || '0'} - {filters.maxPER || '∞'}
              </span>
            )}
            {(filters.minROE || filters.maxROE) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                ROE: {filters.minROE || '0'}% - {filters.maxROE || '∞'}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}