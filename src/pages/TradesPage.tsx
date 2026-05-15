import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import TradeForm from '../components/trades/TradeForm'
import TradeHistory from '../components/trades/TradeHistory'
import CsvImport from '../components/trades/CsvImport'
import { useTrades } from '../hooks/useTrades'

type Tab = 'log' | 'history'

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const { addTrade, deleteTrade, fetchTrades } = useTrades()

  const switchToLog = () => setActiveTab('log')
  const switchToHistory = () => setActiveTab('history')

  return (
    <PageTransition>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {/* Tab bar */}
        <div className="flex bg-zinc-900 rounded-xl p-1 mb-5 border border-zinc-800">
          {(['log', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {tab === 'log' ? '+ Log Trade' : 'History'}
            </button>
          ))}
        </div>

        {/* Tab content with animation */}
        <AnimatePresence mode="wait">
          {activeTab === 'log' ? (
            <motion.div
              key="log"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <TradeForm
                  onAdd={addTrade}
                  onSuccess={switchToHistory}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TradeHistory
                onAddTrade={switchToLog}
                onDelete={deleteTrade}
                onImportCsv={() => setIsImportOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isImportOpen && (
          <CsvImport
            onSuccess={fetchTrades}
            onClose={() => {
              setIsImportOpen(false)
              setActiveTab('history')
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
