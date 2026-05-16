const rawKey: string | undefined = import.meta.env.VITE_FINNHUB_API_KEY
const isPlaceholder = !rawKey || rawKey === 'your_key_here' || rawKey.startsWith('YOUR_')
const apiKey = isPlaceholder ? undefined : rawKey

export async function getLivePrice(symbol: string): Promise<number | null> {
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
    )
    if (!res.ok) return null
    const data = (await res.json()) as { c?: number }
    return data.c != null && data.c > 0 ? data.c : null
  } catch {
    return null
  }
}

export async function getLivePrices(symbols: string[]): Promise<Record<string, number | null>> {
  const unique = [...new Set(symbols)]
  const entries = await Promise.all(
    unique.map(async (sym) => [sym, await getLivePrice(sym)] as const)
  )
  return Object.fromEntries(entries)
}
