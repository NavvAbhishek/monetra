import { useState, type DragEvent } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'

export type FilePickerProps = {
  id: string
  /** `accept` attribute, e.g. ".csv,text/csv". */
  accept?: string
  onFile: (file: File) => void
  title: string
  hint?: string
  /** Name of the file chosen last, shown inside the box. */
  fileName?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

/** Dashed drop box: click to choose a file, or drag one onto it. The real file input is visually hidden but keyboard-focusable. */
export const FilePicker = ({ id, accept, onFile, title, hint, fileName, disabled, invalid, className }: FilePickerProps) => {
  const [dragging, setDragging] = useState(false)

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && !disabled) onFile(file)
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-1.5 rounded-table border-2 border-dashed bg-card px-5 py-7 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
        invalid ? 'border-danger' : dragging ? 'border-primary bg-primary-soft' : 'border-line-strong hover:bg-muted',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <Icon.Upload className="size-6 text-primary" aria-hidden />
      <span className="text-base font-bold text-ink">{title}</span>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      {fileName && (
        <span className="flex max-w-full items-center gap-1.5 text-sm font-semibold text-primary-hover">
          <Icon.FileSpreadsheet className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{fileName}</span>
        </span>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = '' // choosing the same file again should still fire
        }}
      />
    </label>
  )
}
