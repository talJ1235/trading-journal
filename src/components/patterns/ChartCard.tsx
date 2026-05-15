interface Props {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export default function ChartCard({ title, children, action }: Props) {
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
