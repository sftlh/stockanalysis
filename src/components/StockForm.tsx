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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Issuer Name *</label>
          <input
            type="text"
            name="issuerName"
            value={formData.issuerName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            placeholder="e.g., Apple Inc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sector *</label>
          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">Select Sector</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Consumer Goods">Consumer Goods</option>
            <option value="Consumer Cyclical">Consumer Cyclical</option>
            <option value="Energy">Energy</option>
            <option value="Industrials">Industrials</option>
            <option value="Basic Materials">Basic Materials</option>
            <option value="Infrastructures">Infrastructures</option>
            <option value="Properties & Real Estate">Properties & Real Estate</option>
            <option value="Consumer Non-Cyclicals">Consumer Non-Cyclicals</option>
            <option value="Transportation & Logistic">Transportation & Logistic</option>
            <option value="Utilities">Utilities</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Communication Services">Communication Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Net Profit (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="netProfit"
            value={formData.netProfit}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">EPS (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Current Stock Price (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Equity (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="totalEquity"
            value={formData.totalEquity}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Debt (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="totalDebt"
            value={formData.totalDebt}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Dividends (Rp) *</label>
          <input
            type="number"
            step="0.01"
            name="dividends"
            value={formData.dividends}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quarter *</label>
          <select
            name="quarter"
            value={formData.quarter}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value={1}>Q1</option>
            <option value={2}>Q2</option>
            <option value={3}>Q3</option>
            <option value={4}>Q4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          />
        </div>
      </div>
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <button 
          type="submit" 
          className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Add Stock Data
        </button>
      </div>
    </form>
  )
}