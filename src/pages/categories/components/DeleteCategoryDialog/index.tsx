import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/category'
import { pluralise } from '../../helpers/CategoriesHelpers'
import { useDeleteCategoryDialog } from './hooks/useDeleteCategoryDialog'

type DeleteCategoryDialogProps = {
  category: Category
  categories: readonly Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

/**
 * Confirms deleting a category. If expenses still use it, asks where to move them first
 * so nothing is lost (CLAUDE.md §7.3). The last category can't be deleted.
 */
const DeleteCategoryDialog = ({ category, categories, open, onOpenChange, onDeleted }: DeleteCategoryDialogProps) => {
  const d = useDeleteCategoryDialog({ category, categories, open, onDeleted })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={`Delete “${category.name}”?`} />

        {d.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : d.isLastCategory ? (
          <p className="text-base text-muted-foreground">You need at least one category, so this one can’t be deleted. Add another first.</p>
        ) : d.needsMove ? (
          <div className="flex flex-col gap-3">
            <p className="text-base text-muted-foreground">
              {pluralise(d.expenseCount, 'expense')} use this category. They’ll be moved so nothing is lost.
            </p>
            <FormField id="move-to" label="Move them to" labelVariant="strong">
              <Select value={d.moveToId} onValueChange={d.setMoveToId}>
                <SelectTrigger id="move-to" size="md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {d.others.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        ) : (
          <p className="text-base text-muted-foreground">No expenses use this category. This can’t be undone.</p>
        )}

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="surface" size="lg">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="danger"
            size="lg"
            loading={d.isDeleting}
            disabled={d.isLoading || d.isLastCategory || (d.needsMove && !d.moveToId)}
            onClick={d.confirm}
          >
            {d.needsMove ? 'Move & delete' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteCategoryDialog
