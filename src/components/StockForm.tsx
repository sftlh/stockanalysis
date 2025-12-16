'use client'

import { useState } from 'react'

interface StockData {
  issuerName: string
  sector: string
  netProfit: number
  eps: number
  currentPrice: number
  totalEquity: number
  totalDebt: number
  dividends: number
  quarter: number
  year: number
}

interface StockFormProps {
  onSubmit: () => void
}

export default function StockForm({ onSubmit }: StockFormProps) {
  const [formData, setFormData] = useState<StockData>({
    issuerName: '',
    sector: '',
    netProfit: 0,
    eps: 0,
    currentPrice: 0,
    totalEquity: 0,
    totalDebt: 0,
    dividends: 0,
    quarter: 1,
    year: new Date().getFullYear()
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quarter' || name === 'year' || name === 'outstandingShares'
        ? parseInt(value) || 0
        : name === 'issuerName' || name === 'sector'
        ? value
        : parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.issuerName.trim()) {
      alert('Issuer Name is required')
      return
    }

    if (!formData.sector) {
      alert('Sector is required')
      return
    }

    // Validate EPS is not zero
    if (formData.eps === 0) {
      alert('EPS cannot be zero. Please enter a valid EPS value.')
      return
    }

    // Calculate outstanding shares
    const outstandingShares = Math.round(formData.netProfit / formData.eps)

    const submitData = {
      ...formData,
      outstandingShares
    }

    try {
      const response = await fetch('/api/stockdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert('Stock data added successfully!')
        setFormData({
          issuerName: '',
          sector: '',
          netProfit: 0,
          eps: 0,
          currentPrice: 0,
          totalEquity: 0,
          totalDebt: 0,
          dividends: 0,
          quarter: 1,
          year: new Date().getFullYear()
        })
        onSubmit()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('stockdata:changed'))
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to add stock data')
      }
    } catch (error) {
      console.error(error)
      alert('Error adding stock data')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Issuer Name *</label>
          <input
            type="text"
            name="issuerName"
            value={formData.issuerName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
            placeholder="e.g., Apple Inc."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Sector *</label>
          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          >
            <option value="" className="bg-gray-800 text-white">Select Sector</option>
            <option value="Technology" className="bg-gray-800 text-white">Technology</option>
            <option value="Healthcare" className="bg-gray-800 text-white">Healthcare</option>
            <option value="Financial Services" className="bg-gray-800 text-white">Financial Services</option>
            <option value="Consumer Goods" className="bg-gray-800 text-white">Consumer Goods</option>
            <option value="Consumer Cyclical" className="bg-gray-800 text-white">Consumer Cyclical</option>
            <option value="Energy" className="bg-gray-800 text-white">Energy</option>
            <option value="Industrials" className="bg-gray-800 text-white">Industrials</option>
            <option value="Basic Materials" className="bg-gray-800 text-white">Basic Materials</option>
            <option value="Infrastructures" className="bg-gray-800 text-white">Infrastructures</option>
            <option value="Properties & Real Estate" className="bg-gray-800 text-white">Properties & Real Estate</option>
            <option value="Consumer Non-Cyclicals" className="bg-gray-800 text-white">Consumer Non-Cyclicals</option>
            <option value="Transportation & Logistic" className="bg-gray-800 text-white">Transportation & Logistic</option>
            <option value="Utilities" className="bg-gray-800 text-white">Utilities</option>
            <option value="Real Estate" className="bg-gray-800 text-white">Real Estate</option>
            <option value="Communication Services" className="bg-gray-800 text-white">Communication Services</option>
            <option value="Other" className="bg-gray-800 text-white">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Net Profit (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="netProfit"
            value={formData.netProfit}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">EPS (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Current Stock Price (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Total Equity (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="totalEquity"
            value={formData.totalEquity}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Total Debt (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="totalDebt"
            value={formData.totalDebt}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Dividends (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="dividends"
            value={formData.dividends}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Quarter *</label>
          <select
            name="quarter"
            value={formData.quarter}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          >
            <option value={1} className="bg-gray-800 text-white">Q1</option>
            <option value={2} className="bg-gray-800 text-white">Q2</option>
            <option value={3} className="bg-gray-800 text-white">Q3</option>
            <option value={4} className="bg-gray-800 text-white">Q4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3">Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
          />
        </div>
      </div>
      <div className="flex justify-end pt-8 border-t border-white/10">
        <button
          type="submit"
          className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
        >
          Add Stock Data
        </button>
      </div>
    </form>
  )
}