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
    <div className="glass-card card-modern p-8 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 rounded-xl p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Advanced Filters</h3>
            <p className="text-white/70">Refine your stock analysis with precision filters</p>
          </div>
          {activeFiltersCount > 0 && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="btn-outline flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
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
          <label className="block text-sm font-semibold text-white/90 mb-3">Issuer Name</label>
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
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
          {showIssuerDropdown && filteredIssuers.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
              {filteredIssuers.map((issuer) => (
                <div
                  key={issuer}
                  onClick={() => {
                    handleFilterChange('issuerName', issuer)
                    setShowIssuerDropdown(false)
                  }}
                  className="px-4 py-3 hover:bg-white/10 cursor-pointer text-white/90 text-sm transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                >
                  {issuer}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">All Sectors</option>
            {availableSectors.map((sector: string) => (
              <option key={sector} value={sector} className="bg-gray-800 text-white">{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Year</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">All Years</option>
            {availableYears.map((year: number) => (
              <option key={year} value={year} className="bg-gray-800 text-white">{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Quarter</label>
          <select
            value={filters.quarter}
            onChange={(e) => handleFilterChange('quarter', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">All Quarters</option>
            <option value="1" className="bg-gray-800 text-white">Q1</option>
            <option value="2" className="bg-gray-800 text-white">Q2</option>
            <option value="3" className="bg-gray-800 text-white">Q3</option>
            <option value="4" className="bg-gray-800 text-white">Q4</option>
          </select>
        </div>

        {/* PER Range */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">PER Range</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minPER}
              onChange={(e) => handleFilterChange('minPER', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxPER}
              onChange={(e) => handleFilterChange('maxPER', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* ROE Range */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">ROE Range (%)</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minROE}
              onChange={(e) => handleFilterChange('minROE', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxROE}
              onChange={(e) => handleFilterChange('maxROE', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* PBV Range */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">PBV Range</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minPBV}
              onChange={(e) => handleFilterChange('minPBV', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxPBV}
              onChange={(e) => handleFilterChange('maxPBV', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* DER Range */}
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">DER Range (%)</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.minDER}
              onChange={(e) => handleFilterChange('minDER', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.maxDER}
              onChange={(e) => handleFilterChange('maxDER', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-3">
            {filters.issuerName && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Issuer: {filters.issuerName}
              </span>
            )}
            {filters.sector && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Sector: {filters.sector}
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Year: {filters.year}
              </span>
            )}
            {filters.quarter && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quarter: Q{filters.quarter}
              </span>
            )}
            {(filters.minPER || filters.maxPER) && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                PER: {filters.minPER || '0'} - {filters.maxPER || '∞'}
              </span>
            )}
            {(filters.minROE || filters.maxROE) && (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ROE: {filters.minROE || '0'}% - {filters.maxROE || '∞'}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
