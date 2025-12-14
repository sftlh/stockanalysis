import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const stockId = parseInt(id)
    if (isNaN(stockId)) {
      return NextResponse.json({ error: 'Invalid stock ID' }, { status: 400 })
    }

    // Find the stock and verify ownership
    const stock = await prisma.stockData.findFirst({
      where: {
        id: stockId,
        userId: user.id
      }
    })

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    // Get all stocks for this issuer
    const allIssuerStocks = await prisma.stockData.findMany({
      where: {
        issuerName: stock.issuerName,
        userId: user.id
      }
    })

    // Toggle bookmark status for all stocks of this issuer
    const newBookmarkStatus = !stock.bookmarked
    await prisma.stockData.updateMany({
      where: {
        issuerName: stock.issuerName,
        userId: user.id
      },
      data: { bookmarked: newBookmarkStatus }
    })

    return NextResponse.json({
      success: true,
      bookmarked: newBookmarkStatus,
      issuerName: stock.issuerName,
      affectedRecords: allIssuerStocks.length
    })

  } catch (error) {
    console.error('Bookmark toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}