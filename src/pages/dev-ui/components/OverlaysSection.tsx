import * as Icon from '@/components/icons'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from '@/components/ui/sheet'
import { Notification } from '@/utils/notification'
import Section, { Row } from './Section'

const ConfirmDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="danger-soft" onClick={() => setOpen(true)}>
        Delete something
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this expense?"
        description="This can’t be undone."
        onConfirm={() => {
          setOpen(false)
          Notification.success('Deleted')
        }}
      />
    </>
  )
}

const OverlaysSection = () => (
  <Section title="Overlays & feedback" description="dialog · confirm-dialog · sheet · popover · dropdown-menu · toasts (utils/notification)">
    <Row label="ConfirmDialog (every delete asks first)">
      <ConfirmDemo />
    </Row>

    <Row label="Dialog (D3 modal)">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader title="Edit expense" />
          <div className="grid grid-cols-2 gap-2.5">
            <FormField id="dlg-date" label="Date" labelVariant="muted">
              <Input id="dlg-date" variant="filled" defaultValue="Thu, Nov 26, 2026" />
            </FormField>
            <FormField id="dlg-note" label="Note" labelVariant="muted">
              <Input id="dlg-note" variant="filled" defaultValue="Lunch with Ana" />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="danger-ghost" size="lg" className="px-1.5">
              Delete
            </Button>
            <span className="flex-1" />
            <DialogClose asChild>
              <Button variant="surface" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Row>

    <Row label="Sheet · right / bottom">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Right panel</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader title="Edit category" />
          <FormField id="sheet-name" label="Name" labelVariant="strong">
            <Input id="sheet-name" size="md" defaultValue="Groceries" />
          </FormField>
          <SheetFooter>
            <Button variant="danger-soft" size="lg" className="flex-1">
              Delete
            </Button>
            <Button size="lg" className="flex-2">
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bottom sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader title="Select dates" />
          <p className="text-base text-muted-foreground">Mobile date range picker goes here (Phase 8).</p>
          <Button size="xl" fullWidth>
            Show expenses
          </Button>
        </SheetContent>
      </Sheet>
    </Row>

    <Row label="Popover · DropdownMenu">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="surface" className="border border-line">
            <Icon.Calendar aria-hidden /> Nov 23 – 29
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <p className="text-xl font-bold">Date range</p>
          <p className="text-sm text-muted-foreground">The calendar is built in Phase 8.</p>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="surface" className="border border-line">
            Menu <Icon.ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Sam Perera</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon.Settings aria-hidden /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">
            <Icon.LogOut aria-hidden /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Row>

    <Row label="Toasts">
      <Button variant="secondary" size="sm" onClick={() => Notification.success('Expense saved')}>
        Success
      </Button>
      <Button variant="secondary" size="sm" onClick={() => Notification.error('Could not save', 'Check your connection')}>
        Error
      </Button>
      <Button variant="secondary" size="sm" onClick={() => Notification.undo('Expense deleted', () => Notification.info('Restored'))}>
        Undo
      </Button>
    </Row>
  </Section>
)

export default OverlaysSection
