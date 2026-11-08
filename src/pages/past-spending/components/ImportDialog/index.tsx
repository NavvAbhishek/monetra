import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { FilePicker } from '@/components/ui/file-picker'
import type { Category } from '@/types/category'
import type { PastRecord } from '@/types/pastRecord'
import { getGranularity } from '@/utils/pastSpendingImport'
import GranularityPicker from './GranularityPicker'
import { useImportPastSpending } from './hooks/useImportPastSpending'
import ImportPreview from './ImportPreview'

type ImportDialogProps = {
  categories: readonly Category[]
  currency: string
  records: readonly PastRecord[]
  firstTrackedAt: Date | null
  onClose: () => void
}

const STEP_TEXT = {
  choose: { n: 1, title: 'Import from CSV', description: 'How is your spending organised in your file?' },
  file: { n: 2, title: 'Get the sample, then upload', description: 'Fill in the sample with your data and upload it here.' },
  preview: { n: 3, title: 'Check and import', description: 'Nothing is saved until you press Import.' },
} as const

/** Import past spending from a CSV: choose daily / weekly / monthly / yearly → download the sample → upload → preview → import. */
const ImportDialog = ({ categories, currency, records, firstTrackedAt, onClose }: ImportDialogProps) => {
  const ctx = useImportPastSpending({ categories, currency, records, firstTrackedAt, onDone: onClose })
  const info = getGranularity(ctx.granularity)
  const text = STEP_TEXT[ctx.step]

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg">
        <DialogHeader title={text.title} description={`Step ${text.n} of 3 · ${text.description}`} />

        {ctx.step === 'choose' && <GranularityPicker value={ctx.granularity} onChange={ctx.setGranularity} />}

        {ctx.step === 'file' && (
          <div className="flex flex-col gap-4">
            <ol className="flex flex-col gap-2 rounded-table bg-card px-5 py-4 text-base text-ink">
              <li>
                <span className="font-bold">1.</span> Download the {info.label.toLowerCase()} sample.
              </li>
              <li>
                <span className="font-bold">2.</span> Open it in Excel, Numbers or Google Sheets. Keep the first row, delete the example rows and add yours — one row per {info.value}, and the amount spent in each category.
              </li>
              <li>
                <span className="font-bold">3.</span> Save it as CSV and upload it below.
              </li>
              <li className="pt-1 text-sm text-muted-foreground">
                First column <span className="font-semibold">{info.column}</span>: {info.format}. Then one column per category, named exactly like your category — a plain number such as 1250.50, or 0 / blank when you spent nothing.
                A column called “All categories” holds a total that isn’t split.
              </li>
            </ol>
            <Button type="button" variant="outline" onClick={ctx.downloadSample} className="self-start">
              <Icon.Download aria-hidden />
              Download {info.label.toLowerCase()} sample (CSV)
            </Button>
            <FilePicker
              id="past-import-file"
              accept=".csv,text/csv"
              title="Choose your CSV file"
              hint="or drag it here"
              fileName={ctx.fileName}
              disabled={ctx.isReading}
              invalid={!!ctx.fileError}
              onFile={(file) => void ctx.readFile(file)}
            />
            {ctx.fileError && (
              <p role="alert" className="rounded-tile bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
                {ctx.fileError}
              </p>
            )}
          </div>
        )}

        {ctx.step === 'preview' && <ImportPreview ctx={ctx} currency={currency} />}

        <DialogFooter className="justify-end">
          {ctx.step === 'choose' && (
            <>
              <DialogClose asChild>
                <Button type="button" variant="muted">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={ctx.goToFile}>
                Next
              </Button>
            </>
          )}
          {ctx.step === 'file' && (
            <Button type="button" variant="muted" onClick={ctx.backToChoose}>
              Back
            </Button>
          )}
          {ctx.step === 'preview' && (
            <>
              <Button type="button" variant="muted" onClick={ctx.backToFile} disabled={ctx.isImporting}>
                Choose another file
              </Button>
              <Button type="button" onClick={ctx.confirmImport} loading={ctx.isImporting} disabled={ctx.readyRows.length === 0}>
                {ctx.readyRows.length > 0 ? `Import ${ctx.readyRows.length} ${ctx.readyRows.length === 1 ? 'record' : 'records'}` : 'Nothing to import'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportDialog
