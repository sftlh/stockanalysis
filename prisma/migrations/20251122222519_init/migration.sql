-- CreateTable
CREATE TABLE "StockData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issuerName" TEXT NOT NULL,
    "netProfit" REAL NOT NULL,
    "eps" REAL NOT NULL,
    "outstandingShares" INTEGER NOT NULL,
    "currentPrice" REAL NOT NULL,
    "totalEquity" REAL NOT NULL,
    "totalDebt" REAL NOT NULL,
    "dividends" REAL NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StockData_issuerName_quarter_year_key" ON "StockData"("issuerName", "quarter", "year");
