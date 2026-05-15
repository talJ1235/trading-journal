function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl p-3 mb-2 border border-zinc-800 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-zinc-700 rounded" />
          <div className="h-3 w-20 bg-zinc-700 rounded" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <div className="h-4 w-20 bg-zinc-700 rounded" />
          <div className="h-3 w-14 bg-zinc-700 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="h-3 w-28 bg-zinc-700 rounded" />
        <div className="h-3 w-16 bg-zinc-700 rounded" />
      </div>
    </div>
  )
}

export default function TradeSkeleton() {
  return (
    <div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
