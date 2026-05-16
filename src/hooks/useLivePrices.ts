import { useState, useEffect, useCallback, useRef } from 'react'
import { getLivePrices } from '../lib/finnhub'

export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number | null>>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const symbolsRef = useRef(symbols)
  symbolsRef.current = symbols

  const refresh = useCallback(async () => {
    const syms = symbolsRef.current
    if (syms.length === 0) return
    const result = await getLivePrices(syms)
    setPrices(result)
    setLastUpdated(new Date())
  }, [])

  const symbolsKey = symbols.join(',')

  useEffect(() => {
    if (symbols.length === 0) return
    void refresh()
    const interval = setInterval(() => void refresh(), 60_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, refresh])

  return { prices, refresh, lastUpdated }
}
