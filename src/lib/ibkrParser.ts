import Papa from 'papaparse'

export interface IBKRRow {
  symbol: string
  direction: 'long' | 'short'
  entry_date: string
  quantity: number
  entry_price: number
  pnl: number | null
  type: 'stock'
}

export interface ParseResult {
  rows: IBKRRow[]
  skipped: number
}

function stripTime(dateStr: string): string {
  // "2024-01-15, 09:30:00" or "2024-01-15" → "2024-01-15"
  return dateStr.split(',')[0].trim()
}

export function parseIBKRCsv(csvString: string): ParseResult {
  const result = Papa.parse<string[]>(csvString, { skipEmptyLines: true })
  const allRows = result.data

  // Find the header row for the Trades section
  let headerIdx = -1
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]
    if (row[0] === 'Trades' && row[1] === 'Header') {
      headerIdx = i
      break
    }
  }

  if (headerIdx === -1) {
    return { rows: [], skipped: 0 }
  }

  const headers = allRows[headerIdx].map((h) => h.trim())

  const col = (name: string) => headers.indexOf(name)

  const idxDataDiscriminator = col('DataDiscriminator')
  const idxSymbol = col('Symbol')
  const idxDateTime = col('Date/Time')
  const idxQuantity = col('Quantity')
  const idxTPrice = col('T. Price')
  const idxRealizedPnl = col('Realized P/L')
  const idxBuySell = col('Buy/Sell')
  const idxAssetCategory = col('Asset Category')

  const rows: IBKRRow[] = []
  let skipped = 0

  for (let i = headerIdx + 1; i < allRows.length; i++) {
    const row = allRows[i]

    // Only process Trades section data rows
    if (row[0] !== 'Trades') break
    if (row[idxDataDiscriminator] !== 'Data') { skipped++; continue }

    // Skip summary/total rows
    const symbol = idxSymbol !== -1 ? row[idxSymbol]?.trim() : ''
    if (!symbol || symbol.toLowerCase().includes('total')) { skipped++; continue }

    // Only stocks
    if (idxAssetCategory !== -1) {
      const cat = row[idxAssetCategory]?.trim().toLowerCase()
      if (cat && cat !== 'stocks') { skipped++; continue }
    }

    const dateRaw = idxDateTime !== -1 ? row[idxDateTime]?.trim() : ''
    const qtyRaw = idxQuantity !== -1 ? row[idxQuantity]?.trim().replace(/,/g, '') : ''
    const priceRaw = idxTPrice !== -1 ? row[idxTPrice]?.trim().replace(/,/g, '') : ''
    const pnlRaw = idxRealizedPnl !== -1 ? row[idxRealizedPnl]?.trim().replace(/,/g, '') : ''
    const buySellRaw = idxBuySell !== -1 ? row[idxBuySell]?.trim() : ''

    const qtyNum = parseFloat(qtyRaw)
    const priceNum = parseFloat(priceRaw)

    if (!dateRaw || isNaN(qtyNum) || isNaN(priceNum)) { skipped++; continue }

    // Direction: prefer Buy/Sell column, fall back to Quantity sign
    let direction: 'long' | 'short'
    if (buySellRaw) {
      direction = buySellRaw.toLowerCase().startsWith('buy') ? 'long' : 'short'
    } else {
      direction = qtyNum >= 0 ? 'long' : 'short'
    }

    const pnlNum = pnlRaw ? parseFloat(pnlRaw) : NaN
    const pnl = !isNaN(pnlNum) && pnlNum !== 0 ? pnlNum : null

    rows.push({
      symbol,
      direction,
      entry_date: stripTime(dateRaw),
      quantity: Math.abs(Math.round(qtyNum)),
      entry_price: priceNum,
      pnl,
      type: 'stock',
    })
  }

  return { rows, skipped }
}
