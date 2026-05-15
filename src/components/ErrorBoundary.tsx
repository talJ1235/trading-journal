import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[40vh] gap-4 p-6 text-center">
          <p className="text-zinc-300 font-medium">Something went wrong</p>
          <p className="text-zinc-500 text-sm">This section failed to load.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
