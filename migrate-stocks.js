import sqlite3 from 'sqlite3'
import { PrismaClient } from '@prisma/client'

const postgresClient = new PrismaClient()

const db = new sqlite3.Database('./dev.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message)
    return
  }
  console.log('Connected to SQLite database')

  // Get all stock data
  db.all('SELECT * FROM StockData', [], async (err, stocks) => {
    if (err) {
      console.error('Error reading stocks:', err)
      db.close()
      return
    }

    console.log(`Found ${stocks.length} stock records to migrate`)

    if (stocks.length === 0) {
      console.log('No data to migrate')
      db.close()
      await postgresClient.$disconnect()
      return
    }

    try {
      for (const stock of stocks) {
        await postgresClient.stockData.create({
          data: {
            issuerName: stock.issuerName,
            sector: stock.sector,
            netProfit: stock.netProfit,
            eps: stock.eps,
            outstandingShares: BigInt(stock.outstandingShares),
            currentPrice: stock.currentPrice,
            totalEquity: stock.totalEquity,
            totalDebt: stock.totalDebt,
            dividends: stock.dividends,
            quarter: stock.quarter,
            year: stock.year,
          }
        })
      }

      console.log(`Successfully migrated ${stocks.length} stock records to PostgreSQL!`)

    } catch (error) {
      console.error('Migration error:', error)
    } finally {
      db.close()
      await postgresClient.$disconnect()
    }
  })
})