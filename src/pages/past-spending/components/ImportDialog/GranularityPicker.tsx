import { RadioGroup } from 'radix-ui'
import { IMPORT_GRANULARITIES, type ImportGranularity } from '@/utils/pastSpendingImport'

/** "How is your data organised?" — four choice cards: daily, weekly, monthly, yearly. */
const GranularityPicker = ({ value, onChange }: { value: ImportGranularity; onChange: (value: ImportGranularity) => void }) => (
  <RadioGroup.Root aria-label="How your file is organised" value={value} onValueChange={(v) => onChange(v as ImportGranularity)} className="grid gap-2.5 sm:grid-cols-2">
    {IMPORT_GRANULARITIES.map((g) => (
      <RadioGroup.Item
        key={g.value}
        value={g.value}
        className="flex cursor-pointer flex-col gap-0.5 rounded-table border-2 border-transparent bg-card p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary-soft"
      >
        <span className="text-lg font-bold text-ink">{g.label}</span>
        <span className="text-sm text-muted-foreground">{g.description}</span>
        <span className="pt-1 text-xs text-muted-foreground">Column “{g.column}”: {g.format}</span>
      </RadioGroup.Item>
    ))}
  </RadioGroup.Root>
)

export default GranularityPicker
