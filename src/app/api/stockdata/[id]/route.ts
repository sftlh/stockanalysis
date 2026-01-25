import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'

export async function PATCH(request: NextRequest, context: any) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = context?.params ? await context.params : context?.params
    const id = Number(params?.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await request.json()

    // Ensure the record belongs to the user
    const existing = await prisma.stockData.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    const updateData: any = {}
    const updatableFields = ['issuerName','netProfit','revenue','operatingCashFlow','eps','outstandingShares','currentPrice','totalEquity','totalDebt','currentAssets','currentLiabilities','dividends','quarter','year','sector','bookmarked']

    updatableFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field]
    })

    // Convert numeric fields
    if (updateData.outstandingShares !== undefined) {
      try {
        updateData.outstandingShares = BigInt(updateData.outstandingShares)
      } catch (e) {
        return NextResponse.json({ error: 'Invalid outstandingShares' }, { status: 400 })
      }
    }
    if (updateData.netProfit !== undefined) updateData.netProfit = parseFloat(updateData.netProfit)
    if (updateData.revenue !== undefined) updateData.revenue = parseFloat(updateData.revenue)
    if (updateData.operatingCashFlow !== undefined) updateData.operatingCashFlow = parseFloat(updateData.operatingCashFlow)
    if (updateData.eps !== undefined) updateData.eps = parseFloat(updateData.eps)
    if (updateData.currentPrice !== undefined) updateData.currentPrice = parseFloat(updateData.currentPrice)
    if (updateData.totalEquity !== undefined) updateData.totalEquity = parseFloat(updateData.totalEquity)
    if (updateData.totalDebt !== undefined) updateData.totalDebt = parseFloat(updateData.totalDebt)
    if (updateData.currentAssets !== undefined) updateData.currentAssets = parseFloat(updateData.currentAssets)
    if (updateData.currentLiabilities !== undefined) updateData.currentLiabilities = parseFloat(updateData.currentLiabilities)
    if (updateData.dividends !== undefined) updateData.dividends = parseFloat(updateData.dividends)
    if (updateData.quarter !== undefined) updateData.quarter = parseInt(updateData.quarter)
    if (updateData.year !== undefined) updateData.year = parseInt(updateData.year)

    const updated = await prisma.stockData.update({
      where: { id },
      data: updateData
    })

    const serialized = { ...updated, outstandingShares: Number(updated.outstandingShares) }
    return NextResponse.json(serialized)
  } catch (error) {
    console.error('PATCH /api/stockdata/:id - Error', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
