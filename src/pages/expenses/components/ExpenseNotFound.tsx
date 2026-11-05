import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Link } from '@/router/navigation'

/** Shown when /expenses/$expenseId points at an expense that doesn't exist (bad link, or deleted). */
const ExpenseNotFound = () => (
  <EmptyState
    emoji="🔍"
    title="Expense not found"
    description="It may have been deleted."
    action={
      <Button asChild>
        <Link to="/expenses">Back to expenses</Link>
      </Button>
    }
  />
)

export default ExpenseNotFound
