import PagePlaceholder from '@/components/PagePlaceholder'
import { useParams } from '@/router/navigation'

/** /expenses/new and /expenses/$expenseId — mobile full screen (M3); desktop uses a modal (D3). */
const ExpenseEditor = () => {
  const { expenseId } = useParams({ strict: false })
  return (
    <PagePlaceholder
      title={expenseId ? `Edit expense ${expenseId}` : 'Add expense'}
      screens="M3 · D3"
      phase={7}
    />
  )
}

export default ExpenseEditor
