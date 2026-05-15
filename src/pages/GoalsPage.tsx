import PageTransition from '../components/PageTransition'
import GoalCard from '../components/goals/GoalCard'
import DepositList from '../components/goals/DepositList'
import YtdComparison from '../components/goals/YtdComparison'
import { useGoals } from '../hooks/useGoals'
import { useDeposits } from '../hooks/useDeposits'
import { usePatterns } from '../hooks/usePatterns'
import { useTradesStore } from '../store/tradesStore'

export default function GoalsPage() {
  const { goal, loading: goalLoading, createGoal, updateGoal } = useGoals()
  const { deposits, loading: depositLoading, addDeposit, deleteDeposit } = useDeposits()
  const patterns = usePatterns()
  const { trades } = useTradesStore()

  return (
    <PageTransition>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24 md:pb-8">
        <GoalCard
          goal={goal}
          loading={goalLoading}
          monthlyPerformance={patterns.monthlyPerformance}
          onCreate={createGoal}
          onUpdate={updateGoal}
        />
        <DepositList
          deposits={deposits}
          loading={depositLoading}
          onAdd={addDeposit}
          onDelete={deleteDeposit}
        />
        <YtdComparison trades={trades} />
      </div>
    </PageTransition>
  )
}
