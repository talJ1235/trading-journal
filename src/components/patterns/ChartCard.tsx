interface Props {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  loading?: boolean
}

export default function ChartCard({ title, children, action, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 animate-pulse">
        <div className="h-3 bg-zinc-800 rounded w-28 mb-4" />
        <div className="h-32 bg-zinc-800 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}
