import { useMemo, useState } from 'react'
import { useImportPastRecordsMutation } from '@/queries/past-records/past-records-mutations'
import type { Category } from '@/types/category'
import type { PastRecord } from '@/types/pastRecord'
import { downloadCsv } from '@/utils/csv'
import { overlapsTracking } from '@/utils/pastSpending'
import { buildSampleCsv, parseImportCsv, sampleFilename, type ImportGranularity, type ImportPreview } from '@/utils/pastSpendingImport'

export type ImportStep = 'choose' | 'file' | 'preview'

const MAX_FILE_BYTES = 1024 * 1024 // 1 MB is far more than 500 rows need

type Options = {
  categories: readonly Category[]
  currency: string
  records: readonly PastRecord[]
  firstTrackedAt: Date | null
  onDone: () => void
}

/** The three-step import: choose how the file is organised → get the sample and upload → check the preview and import. */
export const useImportPastSpending = ({ categories, currency, records, firstTrackedAt, onDone }: Options) => {
  const [step, setStep] = useState<ImportStep>('choose')
  const [granularity, setGranularity] = useState<ImportGranularity>('month')
  const [fileName, setFileName] = useState<string>()
  const [fileError, setFileError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isReading, setIsReading] = useState(false)
  const importMutation = useImportPastRecordsMutation()

  const readyRows = useMemo(() => (preview?.rows ?? []).filter((r) => !r.duplicate), [preview])
  const duplicateCount = (preview?.rows.length ?? 0) - readyRows.length
  const overlapCount = readyRows.filter((r) => overlapsTracking(r.input.end, firstTrackedAt)).length

  const readFile = async (file: File) => {
    setFileName(file.name)
    setFileError(null)
    if (file.size > MAX_FILE_BYTES) {
      setFileError('That file is too large. Use a CSV with up to 1,000 rows.')
      return
    }
    setIsReading(true)
    try {
      const result = parseImportCsv(await file.text(), granularity, categories, currency, records, new Date())
      if (result.fileError) {
        setFileError(result.fileError)
      } else {
        setPreview(result)
        setStep('preview')
      }
    } catch {
      setFileError('Couldn’t read that file. Save it as CSV and try again.')
    } finally {
      setIsReading(false)
    }
  }

  return {
    step,
    granularity,
    setGranularity,
    fileName,
    fileError,
    preview,
    isReading,
    readyRows,
    duplicateCount,
    overlapCount,
    isImporting: importMutation.isPending,
    goToFile: () => setStep('file'),
    backToChoose: () => {
      setStep('choose')
      setFileError(null)
    },
    backToFile: () => {
      setStep('file')
      setPreview(null)
      setFileError(null)
    },
    downloadSample: () => downloadCsv(sampleFilename(granularity), buildSampleCsv(granularity, categories, currency, new Date())),
    readFile,
    confirmImport: () => importMutation.mutate(readyRows.map((r) => r.input), { onSuccess: onDone }),
  }
}

export type ImportCtx = ReturnType<typeof useImportPastSpending>
