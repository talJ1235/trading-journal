import { TAG_CONFIG } from '../../lib/constants'
import type { TradeTag } from '../../types'

interface Props {
  tag: TradeTag | null | undefined
  size?: 'sm' | 'md'
}

export default function TagBadge({ tag, size = 'sm' }: Props) {
  if (!tag) return null
  const { bg, text, label } = TAG_CONFIG[tag]
  return (
    <span
      className={`font-medium rounded-full whitespace-nowrap ${bg} ${text} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
    >
      {label}
    </span>
  )
}
