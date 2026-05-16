import Papa from 'papaparse'

// ─── Known ETF symbols ────────────────────────────────────────────────────────
const KNOWN_ETFS = new Set([
  'IGV', 'QQQM', 'CSPX', 'SPY', 'QQQ', 'IVV', 'VTI',
  'GLD', 'TLT', 'VOO', 'ARKK', 'XLK', 'XLF', 'IBIT', 'SOXX', 'SMH',
])

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IBKRRow {
  symbol: string
  direction: 'long' | 'short'
  entry_date: string
  quantity: number
  entry_price: number
  pnl: number | null
  type: 'stock' | 'etf'
}

export interface IBKRDepositRow {
  date: string    // YYYY-MM-DD
  amount: number  // positive = deposit, negative = withdrawal
  notes: string
}

export interface IBKRParseResult {
  rows: IBKRRow[]
  deposits: IBKRDepositRow[]
  skipped: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stripTime(s: string): string {
  // "2026-05-12 09:30:00" or "2026-05-12, 09:30:00" → "2026-05-12"
  return s.split(',')[0].split(' ')[0].trim()
}

function parseNum(s: string | undefined): number | null {
  if (!s || s.trim() === '-' || s.trim() === '') return null
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

function etfOrStock(symbol: string): 'stock' | 'etf' {
  return KNOWN_ETFS.has(symbol.trim().toUpperCase()) ? 'etf' : 'stock'
}

// ─── Format detection ─────────────────────────────────────────────────────────
type Format = 'txn' | 'trades' | 'unknown'

function detectFormat(allRows: string[][]): Format {
  for (const row of allRows) {
    if (row[0] === 'Transaction History') return 'txn'
    if (row[0] === 'Trades') return 'trades'
  }
  return 'unknown'
}

// ─── Transaction History parser ───────────────────────────────────────────────
// Columns: [0]section [1]type [2]date [3]account [4]description
//          [5]txnType [6]symbol [7]qty [8]price [9]currency
//          [10]grossAmount [11]commission [12]netAmount
function parseTxnHistory(allRows: string[][]): IBKRParseResult {
  const rows: IBKRRow[] = []
  const deposits: IBKRDepositRow[] = []
  let skipped = 0

  for (const row of allRows) {
    if (row[0] !== 'Transaction History' || row[1] !== 'Data') continue

    const txnType = (row[5] ?? '').trim()
    const symbol = (row[6] ?? '').trim().toUpperCase()

    if (txnType === 'Buy' || txnType === 'Sell') {
      if (!symbol || symbol === '-') { skipped++; continue }

      const date = stripTime(row[2] ?? '')
      const qty = parseNum(row[7])
      const price = parseNum(row[8])

      if (!date || qty == null || price == null || price <= 0) { skipped++; continue }

      // Buy = position opened → no realized P&L; Sell = position closed → use gross amount
      const rawPnl = txnType === 'Sell' ? parseNum(row[10]) : null
      const pnl = rawPnl === 0 ? null : rawPnl

      const parsedRow: IBKRRow = {
        symbol,
        direction: txnType === 'Buy' ? 'long' : 'short',
        entry_date: date,
        quantity: Math.abs(qty) || 1,
        entry_price: price,
        pnl,
        type: etfOrStock(symbol),
      }
      if (parsedRow.type !== 'stock' && parsedRow.type !== 'etf') parsedRow.type = 'stock'
      rows.push(parsedRow)
    } else if (txnType === 'Deposit' || txnType === 'Withdrawal') {
      const amount = parseNum(row[10])
      if (amount == null) { skipped++; continue }

      deposits.push({
        date: stripTime(row[2] ?? ''),
        amount,
        notes: (row[4] ?? '').trim(),
      })
    } else {
      // Adjustment, Dividend, Interest, Tax, Forex Trade Component, etc.
      skipped++
    }
  }

  const validRows = rows.filter((r) => r.type === 'stock' || r.type === 'etf')
  return { rows: validRows, deposits, skipped: skipped + (rows.length - validRows.length) }
}

// ─── Classic Trades report parser (unchanged logic, updated return type) ───────
// Columns are header-driven; see IBKRRow for field mapping.
function parseTradesReport(allRows: string[][]): IBKRParseResult {
  let headerIdx = -1
  for (let i = 0; i < allRows.length; i++) {
    if (allRows[i][0] === 'Trades' && allRows[i][1] === 'Header') {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) return { rows: [], deposits: [], skipped: 0 }

  const headers = allRows[headerIdx].map((h) => h.trim())
  const col = (name: string) => headers.indexOf(name)

  const idxDisc = col('DataDiscriminator')
  const idxSymbol = col('Symbol')
  const idxDateTime = col('Date/Time')
  const idxQty = col('Quantity')
  const idxTPrice = col('T. Price')
  const idxPnl = col('Realized P/L')
  const idxBuySell = col('Buy/Sell')
  const idxAsset = col('Asset Category')

  const rows: IBKRRow[] = []
  let skipped = 0

  for (let i = headerIdx + 1; i < allRows.length; i++) {
    const row = allRows[i]
    if (row[0] !== 'Trades') break
    if (row[idxDisc] !== 'Data') { skipped++; continue }

    const symbol = (idxSymbol !== -1 ? row[idxSymbol]?.trim() : '').toUpperCase()
    if (!symbol || symbol.includes('TOTAL')) { skipped++; continue }

    if (idxAsset !== -1) {
      const cat = row[idxAsset]?.trim().toLowerCase()
      if (cat && cat !== 'stocks') { skipped++; continue }
    }

    const dateRaw = (idxDateTime !== -1 ? row[idxDateTime]?.trim() : '') ?? ''
    const qtyRaw = (idxQty !== -1 ? row[idxQty]?.trim().replace(/,/g, '') : '') ?? ''
    const priceRaw = (idxTPrice !== -1 ? row[idxTPrice]?.trim().replace(/,/g, '') : '') ?? ''
    const pnlRaw = (idxPnl !== -1 ? row[idxPnl]?.trim().replace(/,/g, '') : '') ?? ''
    const buySellRaw = (idxBuySell !== -1 ? row[idxBuySell]?.trim() : '') ?? ''

    const qty = parseFloat(qtyRaw)
    const price = parseFloat(priceRaw)
    if (!dateRaw || isNaN(qty) || isNaN(price)) { skipped++; continue }

    const direction: 'long' | 'short' = buySellRaw
      ? (buySellRaw.toLowerCase().startsWith('buy') ? 'long' : 'short')
      : (qty >= 0 ? 'long' : 'short')

    const pnlNum = pnlRaw ? parseFloat(pnlRaw) : NaN
    const pnl = !isNaN(pnlNum) && pnlNum !== 0 ? pnlNum : null

    const parsedRow: IBKRRow = {
      symbol,
      direction,
      entry_date: stripTime(dateRaw),
      quantity: Math.abs(Math.round(qty)) || 1,
      entry_price: price,
      pnl,
      type: etfOrStock(symbol),
    }
    if (parsedRow.type !== 'stock' && parsedRow.type !== 'etf') parsedRow.type = 'stock'
    rows.push(parsedRow)
  }

  const validRows = rows.filter((r) => r.type === 'stock' || r.type === 'etf')
  return { rows: validRows, deposits: [], skipped: skipped + (rows.length - validRows.length) }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function parseIBKRCsv(csvString: string): IBKRParseResult {
  const result = Papa.parse<string[]>(csvString, { skipEmptyLines: true })
  const allRows = result.data

  const format = detectFormat(allRows)
  if (format === 'txn') return parseTxnHistory(allRows)
  if (format === 'trades') return parseTradesReport(allRows)
  return { rows: [], deposits: [], skipped: 0 }
}
