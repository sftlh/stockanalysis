import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/stockdata - Fetching stock data')
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookmarked = searchParams.get('bookmarked')

    const whereClause: any = {
      userId: user.id
    }

    if (bookmarked === 'true') {
      whereClause.bookmarked = true
    }

    const stockData = await prisma.stockData.findMany({
      where: whereClause
    })
    console.log(`GET /api/stockdata - Found ${stockData.length} records for user ${user.id}`)

    // Convert BigInt to number for JSON serialization
    const serializedData = stockData.map(stock => ({
      ...stock,
      outstandingShares: Number(stock.outstandingShares)
    }))

    return NextResponse.json(serializedData)
  } catch (error) {
    console.error('GET /api/stockdata - Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/stockdata - Processing request')
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('POST /api/stockdata - Received body:', body)

    const {
      issuerName,
      netProfit,
      eps,
      outstandingShares,
      currentPrice,
      totalEquity,
      totalDebt,
      dividends,
      quarter,
      year,
      sector
    } = body

    console.log('POST /api/stockdata - Creating stock data with:', {
      issuerName,
      netProfit: parseFloat(netProfit),
      eps: parseFloat(eps),
      outstandingShares: BigInt(outstandingShares),
      currentPrice: parseFloat(currentPrice),
      totalEquity: parseFloat(totalEquity),
      totalDebt: parseFloat(totalDebt),
      dividends: parseFloat(dividends),
      quarter: parseInt(quarter),
      year: parseInt(year),
      sector: sector || null,
      userId: user.id
    })

    // Validate outstandingShares
    const outstandingSharesBigInt = BigInt(outstandingShares)
    if (!isFinite(Number(outstandingSharesBigInt))) {
      return NextResponse.json({ error: 'Invalid outstanding shares calculation. Please check EPS and Net Profit values.' }, { status: 400 })
    }

    const stockData = await prisma.stockData.create({
      data: {
        issuerName,
        netProfit: parseFloat(netProfit),
        eps: parseFloat(eps),
        outstandingShares: outstandingSharesBigInt,
        currentPrice: parseFloat(currentPrice),
        totalEquity: parseFloat(totalEquity),
        totalDebt: parseFloat(totalDebt),
        dividends: parseFloat(dividends),
        quarter: parseInt(quarter),
        year: parseInt(year),
        sector: sector || null, // Convert empty string to null for optional field
        userId: user.id
      }
    })

    console.log('POST /api/stockdata - Successfully created:', stockData)

    // Convert BigInt to number for JSON serialization
    const serializedStockData = {
      ...stockData,
      outstandingShares: Number(stockData.outstandingShares)
    }

    return NextResponse.json(serializedStockData, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/stockdata - Error:', error)
    console.error('POST /api/stockdata - Error code:', error.code)
    console.error('POST /api/stockdata - Error message:', error.message)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: `Stock data for issuer in the specified quarter and year already exists. Please update the existing entry or choose a different quarter/year.`
      }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create stock data', details: error.message }, { status: 500 })
  }
}