'use client';

import { useEffect, useState, useMemo } from 'react';

interface StockData {
  id: number;
  issuerName: string;
  sector: string;
  netProfit: number;
  eps: number;
  outstandingShares: number;
  currentPrice: number;
  totalEquity: number;
  totalDebt: number;
  dividends: number;
  quarter: number;
  year: number;
}

interface SectorGroup {
  sector: string;
  stocks: (StockData & {
    per: number;
    pbv: number;
    der: number;
    roe: number;
    npl: number;
    marketCap: number;
  })[];
  sectorStats: {
    totalStocks: number;
    avgPER: number;
    avgPBV: number;
    avgDER: number;
    avgROE: number;
    avgNPL: number;
    totalMarketCap: number;
    avgMarketCap: number;
  };
}

export default function SectorComparisonTable() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('/api/stockdata');
        if (!response.ok) throw new Error('Failed to fetch stock data');
        const data = await response.json();
        setStockData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const sectorGroups = useMemo(() => {
    // First, group by issuer and get the latest data for each issuer
    const issuerMap = new Map<string, StockData>();

    stockData.forEach(stock => {
      const existing = issuerMap.get(stock.issuerName);
      if (!existing ||
          existing.year < stock.year ||
          (existing.year === stock.year && existing.quarter < stock.quarter)) {
        issuerMap.set(stock.issuerName, stock);
      }
    });

    // Now group the latest issuer data by sector
    const sectorMap = new Map<string, StockData[]>();

    Array.from(issuerMap.values()).forEach(stock => {
      if (!sectorMap.has(stock.sector)) {
        sectorMap.set(stock.sector, []);
      }
      sectorMap.get(stock.sector)!.push(stock);
    });

    // Create sector groups with statistics
    const groups: SectorGroup[] = Array.from(sectorMap.entries())
      .map(([sector, stocks]) => {
        // Calculate metrics for each stock
        const stocksWithMetrics = stocks.map(stock => ({
          ...stock,
          per: stock.eps > 0 ? stock.currentPrice / stock.eps : 0,
          pbv: stock.totalEquity > 0 ? (stock.currentPrice * stock.outstandingShares) / stock.totalEquity : 0,
          der: stock.totalEquity > 0 ? stock.totalDebt / stock.totalEquity : 0,
          roe: stock.totalEquity > 0 ? (stock.netProfit / stock.totalEquity) * 100 : 0, // ROE as percentage
          npl: stock.totalDebt > 0 ? (stock.netProfit / stock.totalDebt) * 100 : 0, // NPL as percentage
          marketCap: stock.currentPrice * stock.outstandingShares
        }));

        // Calculate sector averages
        const validPER = stocksWithMetrics.filter(s => s.per > 0);
        const validPBV = stocksWithMetrics.filter(s => s.pbv > 0);
        const validDER = stocksWithMetrics.filter(s => s.der >= 0);
        const validROE = stocksWithMetrics.filter(s => !isNaN(s.roe));
        const validNPL = stocksWithMetrics.filter(s => !isNaN(s.npl));

        return {
          sector,
          stocks: stocksWithMetrics.sort((a, b) => a.issuerName.localeCompare(b.issuerName)), // Sort stocks alphabetically
          sectorStats: {
            totalStocks: stocks.length,
            avgPER: validPER.length > 0 ? validPER.reduce((sum, s) => sum + s.per, 0) / validPER.length : 0,
            avgPBV: validPBV.length > 0 ? validPBV.reduce((sum, s) => sum + s.pbv, 0) / validPBV.length : 0,
            avgDER: validDER.length > 0 ? validDER.reduce((sum, s) => sum + s.der, 0) / validDER.length : 0,
            avgROE: validROE.length > 0 ? validROE.reduce((sum, s) => sum + s.roe, 0) / validROE.length : 0,
            avgNPL: validNPL.length > 0 ? validNPL.reduce((sum, s) => sum + s.npl, 0) / validNPL.length : 0,
            totalMarketCap: stocksWithMetrics.reduce((sum, s) => sum + s.marketCap, 0),
            avgMarketCap: stocksWithMetrics.reduce((sum, s) => sum + s.marketCap, 0) / stocksWithMetrics.length
          }
        };
      })
      .sort((a, b) => b.sectorStats.totalStocks - a.sectorStats.totalStocks); // Sort sectors by stock count

    return groups;
  }, [stockData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isGoodStock = (stock: StockData & { per: number; pbv: number; der: number; roe: number; npl: number; marketCap: number }) => {
    // Criteria for a "good" stock based on valuation metrics
    const goodPER = stock.per > 0 && stock.per < 15 // Reasonable valuation
    const goodROE = stock.roe > 15 // Good profitability
    const goodDER = stock.der >= 0 && stock.der < 1.0 // Reasonable debt level
    const goodPBV = stock.pbv > 0 && stock.pbv < 2.0 // Not overvalued

    // Consider it good if it meets at least 3 out of 4 criteria
    const criteriaMet = [goodPER, goodROE, goodDER, goodPBV].filter(Boolean).length
    return criteriaMet >= 3
  }

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1e12) {
      return `Rp ${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `Rp ${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `Rp ${(value / 1e6).toFixed(2)}M`;
    }
    return formatCurrency(value);
  };

  if (loading) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-2xl mx-auto"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-transparent animate-spin animation-delay-300 opacity-75"></div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Loading Sector Data</h3>
        <p className="text-white/70">Analyzing market sectors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (sectorGroups.length === 0) {
    return (
      <div className="glass-card card-modern p-12 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Sector Data Available</h3>
        <p className="text-white/70">Add stock data to see sector comparisons and analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="glass-card card-modern p-8 fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Total Sectors</h3>
              <p className="text-white/70">Market segments</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {sectorGroups.length}
          </div>
        </div>

        <div className="glass-card card-modern p-8 fade-in-up animation-delay-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Total Stocks</h3>
              <p className="text-white/70">Active positions</p>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {stockData.length}
          </div>
        </div>

        <div className="glass-card card-modern p-8 fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Avg Sector PER</h3>
              <p className="text-white/70">Price-to-earnings ratio</p>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {sectorGroups.length > 0 ? (sectorGroups.reduce((sum, group) => sum + group.sectorStats.avgPER, 0) / sectorGroups.length).toFixed(1) : '0.0'}
          </div>
        </div>

        <div className="glass-card card-modern p-8 fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Avg Sector NPL</h3>
              <p className="text-white/70">Net profit leverage</p>
            </div>
            <div className="bg-orange-500/20 rounded-xl p-4">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold gradient-text">
            {sectorGroups.length > 0 ? (sectorGroups.reduce((sum, group) => sum + group.sectorStats.avgNPL, 0) / sectorGroups.length).toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>

      {/* Sector Comparison Tables */}
      {sectorGroups.map((group, groupIndex) => (
        <div key={group.sector} className={`glass-card card-modern overflow-hidden fade-in-up animation-delay-${(groupIndex + 1) * 100}`}>
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{group.sector}</h3>
                <p className="text-white/70 text-lg">
                  {group.sectorStats.totalStocks} stocks • Avg PER: {group.sectorStats.avgPER.toFixed(2)} •
                  Avg ROE: {group.sectorStats.avgROE.toFixed(1)}% • Avg NPL: {group.sectorStats.avgNPL.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold gradient-text">{group.sectorStats.totalStocks}</div>
                <div className="text-sm text-white/60">companies</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    Issuer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    Last Quarter
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    Last Year
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    PER
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    PBV
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    Net Income
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    DER
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    ROE
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white/80 uppercase tracking-wider">
                    NPL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/5">
                {group.stocks.map((stock, index) => (
                  <tr key={stock.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className={`px-6 py-4 whitespace-nowrap text-lg font-bold ${isGoodStock(stock) ? 'text-green-300 bg-green-500/10' : 'text-white'}`}>
                      {stock.issuerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      Q{stock.quarter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {stock.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {stock.per > 0 ? stock.per.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {stock.pbv > 0 ? stock.pbv.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {formatCurrencyCompact(stock.netProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {stock.der >= 0 ? stock.der.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {!isNaN(stock.roe) ? `${stock.roe.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-white/90 font-medium">
                      {!isNaN(stock.npl) ? `${stock.npl.toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}