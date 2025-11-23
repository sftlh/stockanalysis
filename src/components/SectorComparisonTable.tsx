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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading sector data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (sectorGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No stock data available for sector comparison.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Sectors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{sectorGroups.length}</p>
            </div>
            <div className="bg-green-50 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Stocks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stockData.length}</p>
            </div>
            <div className="bg-blue-50 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Sector PER</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {sectorGroups.length > 0 ? (sectorGroups.reduce((sum, group) => sum + group.sectorStats.avgPER, 0) / sectorGroups.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Sector NPL</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {sectorGroups.length > 0 ? (sectorGroups.reduce((sum, group) => sum + group.sectorStats.avgNPL, 0) / sectorGroups.length).toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="bg-orange-50 rounded-full p-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Comparison Tables */}
      {sectorGroups.map((group) => (
        <div key={group.sector} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{group.sector}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.sectorStats.totalStocks} stocks • Avg PER: {group.sectorStats.avgPER.toFixed(2)} •
                  Avg ROE: {group.sectorStats.avgROE.toFixed(1)}% • Avg NPL: {group.sectorStats.avgNPL.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{group.sectorStats.totalStocks}</div>
                <div className="text-sm text-gray-500">companies</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issuer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Quarter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PBV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.stocks.map((stock, index) => (
                  <tr key={stock.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isGoodStock(stock) ? 'text-green-700 bg-green-50' : 'text-gray-900'}`}>
                      {stock.issuerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Q{stock.quarter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.per > 0 ? stock.per.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.pbv > 0 ? stock.pbv.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrencyCompact(stock.netProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.der >= 0 ? stock.der.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!isNaN(stock.roe) ? `${stock.roe.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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