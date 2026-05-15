export interface FinnhubCandle {
  c?: number[]
  o?: number[]
  s?: string
}

export interface FinnhubQuote {
  c?: number
  pc?: number
}

export async function getSP500WeeklyReturn(
  weekStart: string,
  weekEnd: string
): Promise<number | null> {
  const apiKey: string | undefined = import.meta.env.VITE_FINNHUB_API_KEY
  if (!apiKey) return null

  // Try weekly candle endpoint first (gives true week-to-date return)
  try {
    const from = Math.floor(new Date(weekStart + 'T00:00:00').getTime() / 1000)
    const to = Math.floor(new Date(weekEnd + 'T23:59:59').getTime() / 1000)
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=SPY&resolution=W&from=${from}&to=${to}&token=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`candle ${res.status}`)
    const data = (await res.json()) as FinnhubCandle
    if (data.s === 'ok' && data.o?.length && data.c?.length) {
      const open = data.o[0]
      const close = data.c[data.c.length - 1]
      if (open > 0) return ((close - open) / open) * 100
    }
    throw new Error('no candle data')
  } catch {
    // Fallback: current-day change via quote endpoint
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=SPY&token=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`quote ${res.status}`)
      const data = (await res.json()) as FinnhubQuote
      if (data.c != null && data.pc != null && data.pc > 0) {
        return ((data.c - data.pc) / data.pc) * 100
      }
    } catch {
      // both endpoints failed
    }
    return null
  }
}

/** Fetch SPY year-to-date return (Jan 1 → today) using weekly candle resolution. */
export async function getSP500YtdReturn(): Promise<number | null> {
  const apiKey: string | undefined = import.meta.env.VITE_FINNHUB_API_KEY
  if (!apiKey) return null

  const now = new Date()
  const yearStart = `${now.getFullYear()}-01-01`
  const from = Math.floor(new Date(yearStart + 'T00:00:00').getTime() / 1000)
  const to = Math.floor(now.getTime() / 1000)

  try {
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=SPY&resolution=W&from=${from}&to=${to}&token=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`candle ${res.status}`)
    const data = (await res.json()) as FinnhubCandle
    if (data.s === 'ok' && data.o?.length && data.c?.length) {
      const open = data.o[0]
      const close = data.c[data.c.length - 1]
      if (open > 0) return ((close - open) / open) * 100
    }
    throw new Error('no candle data')
  } catch {
    return null
  }
}
