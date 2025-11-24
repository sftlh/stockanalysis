import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./dev.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
    return
  }
  console.log('Connected to SQLite database')

  // Get table list
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err)
      db.close()
      return
    }

    console.log('Tables:', tables.map(t => t.name))

    // Count stock records
    db.get('SELECT COUNT(*) as count FROM StockData', [], (err, row) => {
      if (err) {
        console.error('Error counting stocks:', err)
      } else {
        console.log(`Stock records: ${row.count}`)
      }

      // Get sample records
      if (row.count > 0) {
        db.all('SELECT issuerName, sector, year, quarter FROM StockData LIMIT 3', [], (err, samples) => {
          if (!err) {
            console.log('Sample records:', samples)
          }
          db.close()
        })
      } else {
        db.close()
      }
    })
  })
})