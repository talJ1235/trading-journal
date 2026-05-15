export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 gap-4">
      <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center animate-pulse">
        <div className="w-7 h-7 rounded-full bg-blue-500" />
      </div>
      <p className="text-zinc-400 text-sm font-medium tracking-wide">Trading Journal</p>
    </div>
  )
}
