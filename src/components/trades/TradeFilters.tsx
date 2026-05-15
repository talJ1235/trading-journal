interface FilterState {
  typeFilter: 'all' | 'stock' | 'etf'
  resultFilter: 'all' | 'win' | 'loss'
  dateFrom: string
  dateTo: string
}

interface Props extends FilterState {
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}

export default function TradeFilters({ typeFilter, resultFilter, dateFrom, dateTo, onChange }: Props) {
  return (
    <div className="space-y-2 mb-3">
      {/* Type + result filters */}
      <div className="flex gap-1.5 flex-wrap">
        <FilterBtn active={typeFilter === 'all'} onClick={() => onChange('typeFilter', 'all')}>
          All
        </FilterBtn>
        <FilterBtn active={typeFilter === 'stock'} onClick={() => onChange('typeFilter', 'stock')}>
          Stock
        </FilterBtn>
        <FilterBtn active={typeFilter === 'etf'} onClick={() => onChange('typeFilter', 'etf')}>
          ETF
        </FilterBtn>
        <div className="w-px bg-zinc-700 mx-0.5" />
        <FilterBtn active={resultFilter === 'all'} onClick={() => onChange('resultFilter', 'all')}>
          All Results
        </FilterBtn>
        <FilterBtn active={resultFilter === 'win'} onClick={() => onChange('resultFilter', 'win')}>
          Wins
        </FilterBtn>
        <FilterBtn active={resultFilter === 'loss'} onClick={() => onChange('resultFilter', 'loss')}>
          Losses
        </FilterBtn>
      </div>

      {/* Date range */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onChange('dateFrom', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-300 text-xs focus:border-blue-500 focus:outline-none"
            placeholder="From"
          />
        </div>
        <div className="flex-1">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onChange('dateTo', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-300 text-xs focus:border-blue-500 focus:outline-none"
            placeholder="To"
          />
        </div>
      </div>
    </div>
  )
}
