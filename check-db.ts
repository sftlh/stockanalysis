import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...')

    const userCount = await prisma.user.count()
    console.log(`👥 Users: ${userCount}`)

    const stockCount = await prisma.stockData.count()
    console.log(`📊 Stock Data: ${stockCount}`)

    const unassignedCount = await prisma.stockData.count({
      where: {
        userId: null
      }
    })
    console.log(`📋 Unassigned Stock Data: ${unassignedCount}`)

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
      })
      console.log('\n👤 Users:')
      users.forEach(user => {
        console.log(`  - ${user.name || user.email} (ID: ${user.id})`)
      })
    }

    if (stockCount > 0) {
      const stocks = await prisma.stockData.findMany({
        take: 5,
        select: {
          id: true,
          issuerName: true,
          userId: true,
          quarter: true,
          year: true
        }
      })
      console.log('\n📈 Sample Stock Data:')
      stocks.forEach(stock => {
        console.log(`  - ${stock.issuerName} Q${stock.quarter} ${stock.year} (User: ${stock.userId || 'unassigned'})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()