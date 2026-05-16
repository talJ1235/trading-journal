interface Props {
  direction: 'long' | 'short'
  entryPrice: string
  plannedTarget: string
  plannedStop: string
  quantity: string
}

interface RRResult {
  risk: number
  reward: number
  ratio: number
  riskPct: number
  rewardPct: number
}

function calcRR(
  direction: 'long' | 'short',
  ep: number, pt: number, ps: number, qty: number
): RRResult | null {
  const risk = direction === 'long' ? (ep - ps) * qty : (ps - ep) * qty
  const reward = direction === 'long' ? (pt - ep) * qty : (ep - pt) * qty
  if (risk <= 0 || reward <= 0) return null
  return {
    risk,
    reward,
    ratio: reward / risk,
    riskPct: ((direction === 'long' ? ep - ps : ps - ep) / ep) * 100,
    rewardPct: ((direction === 'long' ? pt - ep : ep - pt) / ep) * 100,
  }
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function quality(ratio: number): { label: string; color: string } {
  if (ratio >= 3) return { label: 'Excellent ✓✓', color: 'text-green-400' }
  if (ratio >= 2) return { label: 'Good ✓', color: 'text-green-400' }
  if (ratio >= 1) return { label: 'Acceptable ~', color: 'text-yellow-400' }
  return { label: 'Poor ✗', color: 'text-red-400' }
}

export default function RRCalculator({ direction, entryPrice, plannedTarget, plannedStop, quantity }: Props) {
  const ep = parseFloat(entryPrice)
  const pt = parseFloat(plannedTarget)
  const ps = parseFloat(plannedStop)
  const qty = parseFloat(quantity) || 1

  if (isNaN(ep) || isNaN(pt) || isNaN(ps)) return null

  const result = calcRR(direction, ep, pt, ps, qty)
  if (!result) return null

  const { risk, reward, ratio, riskPct, rewardPct } = result
  const q = quality(ratio)
  const riskWidth = Math.round((risk / (risk + reward)) * 100)
  const rewardWidth = 100 - riskWidth

  return (
    <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50 mt-3 space-y-2.5">
      <p className="text-xs text-zinc-400 uppercase tracking-wide">Risk / Reward</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-zinc-500">Risk</span>
          <p className="font-mono text-red-400 font-medium mt-0.5">
            -${fmt(risk)} <span className="text-zinc-500">({riskPct.toFixed(1)}%)</span>
          </p>
        </div>
        <div>
          <span className="text-zinc-500">Reward</span>
          <p className="font-mono text-green-400 font-medium mt-0.5">
            +${fmt(reward)} <span className="text-zinc-500">({rewardPct.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="flex rounded-full overflow-hidden h-2" style={{ transition: 'all 0.3s ease' }}>
        <div className="bg-red-500/70 transition-all duration-300" style={{ width: `${riskWidth}%` }} />
        <div className="bg-green-500/70 transition-all duration-300" style={{ width: `${rewardWidth}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          R:R Ratio — <span className="font-mono font-medium text-white">1 : {ratio.toFixed(2)}</span>
        </span>
        <span className={`font-medium ${q.color}`}>{q.label}</span>
      </div>
    </div>
  )
}
