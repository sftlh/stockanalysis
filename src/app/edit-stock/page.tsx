/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/currency'

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
  bookmarked: boolean
}

export default function EditStockPage() {
  const router = useRouter()
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<StockData | null>(null)
  const [form, setForm] = useState<Partial<StockData>>({})
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchStocks = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/stockdata')
        const data = await res.json()
        if (mounted) setStocks(data || [])
      } catch (e) {
        console.error(e)
      } finally { if (mounted) setLoading(false) }
    }
    fetchStocks()
    return () => { mounted = false }
  }, [])

  const openEdit = (s: StockData) => {
    setEditing(s)
    setForm({
      netProfit: s.netProfit,
      eps: s.eps,
      outstandingShares: s.outstandingShares,
      currentPrice: s.currentPrice,
      totalEquity: s.totalEquity,
      totalDebt: s.totalDebt,
      dividends: s.dividends,
      quarter: s.quarter,
      year: s.year,
      sector: s.sector
    })
  }

  const handleChange = (k: keyof StockData, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    if (!editing) return
    // optimistic update
    setStocks(prev => prev.map(p => p.id === editing.id ? ({ ...p, ...form } as StockData) : p))
    setEditing(null)
    try {
      await fetch(`/api/stockdata/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      // show success toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (e) { console.error('Failed to persist edit', e) }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white/70 hover:text-white mr-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-white/20 mr-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-white">Edit Stocks</h1>
                <p className="text-xs text-white/60">List of editable stock entries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/60 font-medium">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center mb-8">
          <p className="text-white/70">List of your stocks. Click Edit to correct an entry.</p>
        </div>

        <div className="glass-card p-6">
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/80">
                    <th className="py-2 px-3">Issuer</th>
                    <th className="py-2 px-3">Q</th>
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">EPS</th>
                    <th className="py-2 px-3">Net Profit</th>
                    <th className="py-2 px-3">Outstanding</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="py-2 px-3 text-white">{s.issuerName}</td>
                      <td className="py-2 px-3 text-white">Q{s.quarter}</td>
                      <td className="py-2 px-3 text-white">{s.year}</td>
                      <td className="py-2 px-3 text-white">{formatCurrency(s.currentPrice)}</td>
                      <td className="py-2 px-3 text-white">{s.eps}</td>
                      <td className="py-2 px-3 text-white">{formatCurrency(s.netProfit)}</td>
                      <td className="py-2 px-3 text-white">{s.outstandingShares.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <button className="btn-secondary" onClick={() => openEdit(s)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Edit {editing.issuerName} — Q{editing.quarter} {editing.year}</h3>
                <button onClick={() => setEditing(null)} className="text-white/60">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70">Current Price</label>
                  <input type="number" value={form.currentPrice ?? ''} onChange={e => handleChange('currentPrice', parseFloat(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">EPS</label>
                  <input type="number" value={form.eps ?? ''} onChange={e => handleChange('eps', parseFloat(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Net Profit</label>
                  <input type="number" value={form.netProfit ?? ''} onChange={e => handleChange('netProfit', parseFloat(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Outstanding Shares</label>
                  <input type="number" value={form.outstandingShares ?? ''} onChange={e => handleChange('outstandingShares', parseInt(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Total Equity</label>
                  <input type="number" value={form.totalEquity ?? ''} onChange={e => handleChange('totalEquity', parseFloat(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Total Debt</label>
                  <input type="number" value={form.totalDebt ?? ''} onChange={e => handleChange('totalDebt', parseFloat(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Quarter</label>
                  <input type="number" value={form.quarter ?? ''} onChange={e => handleChange('quarter', parseInt(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div>
                  <label className="text-white/70">Year</label>
                  <input type="number" value={form.year ?? ''} onChange={e => handleChange('year', parseInt(e.target.value || '0'))} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/70">Sector</label>
                  <input type="text" value={form.sector ?? ''} onChange={e => handleChange('sector', e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
                <button onClick={save} className="btn-primary">Save</button>
              </div>
              <div className="mt-4 bg-white/5 p-3 rounded">
                <div className="text-sm text-white/70">Schema reference:</div>
                <pre className="text-xs text-white/60">{`netProfit: number\neps: number\noutstandingShares: number\ncurrentPrice: number\ntotalEquity: number\ntotalDebt: number\ndividends: number\nquarter: 1-4\nyear: number\nsector: string`}</pre>
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {showToast && (
          <div className="fixed right-6 bottom-6 z-60">
            <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">Saved successfully</div>
          </div>
        )}
      </div>
    </div>
  )
}
