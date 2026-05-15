import type { Trade } from '../types'

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalTrades: number
  wins: number
  losses: number
  totalPnl: number
  winRate: number
  avgWin: number
  avgLoss: number
  tagBreakdown: Record<string, number>
  followedPlanCount: number
  impulseCount: number
}

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `You are a trading mentor reviewing a student's weekly trades.
Methodology: micha.stocks — focus on discipline, signals, planning, and emotional control.

Analyze the trades and return a structured review with exactly these sections:
1. OVERVIEW — 2 sentences on overall performance
2. WHAT WORKED — bullet points, specific and honest
3. WHAT DIDN'T — bullet points, specific and honest
4. PATTERNS — any behavioral patterns noticed
5. RECOMMENDATION — one concrete action for next week

Rules:
- Be direct, no flattery
- Reference specific trades by symbol when relevant
- Flag impulse trades explicitly
- If win rate > 60% and followed plan: positive tone
- If impulse trades > 30% of total: highlight as main issue
- Max 300 words total
- Write in the same language the trades were entered in`

interface GeminiPart {
  text?: string
}
interface GeminiContent {
  parts?: GeminiPart[]
}
interface GeminiCandidate {
  content?: GeminiContent
}
interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

export async function generateWeeklyReview(
  trades: Trade[],
  stats: WeeklyStats
): Promise<string> {
  const apiKey: string | undefined = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return 'Gemini API key not configured (VITE_GEMINI_API_KEY).'

  const tradesText = trades
    .map(
      (t) =>
        `${t.symbol} (${t.direction}, ${t.tag ?? 'untagged'}): entry $${t.entry_price ?? '?'}, exit $${t.exit_price ?? 'open'}, P&L ${t.pnl != null ? `$${t.pnl.toFixed(2)}` : 'open'}, followed plan: ${t.followed_plan ?? '?'}, emotions: before=${t.emotion_before ?? '?'}/during=${t.emotion_during ?? '?'}/after=${t.emotion_after ?? '?'}${t.signal ? `, signal: ${t.signal}` : ''}`
    )
    .join('\n')

  const statsText = [
    `Week: ${stats.weekStart} to ${stats.weekEnd}`,
    `Trades: ${stats.totalTrades} | Wins: ${stats.wins} | Losses: ${stats.losses}`,
    `Win Rate: ${stats.winRate.toFixed(1)}% | Total P&L: $${stats.totalPnl.toFixed(2)}`,
    `Avg Win: $${stats.avgWin.toFixed(2)} | Avg Loss: $${stats.avgLoss.toFixed(2)}`,
    `Tag breakdown: ${Object.entries(stats.tagBreakdown)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')}`,
    `Followed plan: ${stats.followedPlanCount} | Impulse trades: ${stats.impulseCount}`,
  ].join('\n')

  const userMessage = `${statsText}\n\nTrades:\n${tradesText || 'No trades this week.'}`

  try {
    const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Gemini API ${response.status}: ${body}`)
    }

    const json = (await response.json()) as GeminiResponse
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No review generated.'
  } catch (err) {
    console.error('Gemini error:', err)
    return 'Could not generate review. Check your API key and try again.'
  }
}
