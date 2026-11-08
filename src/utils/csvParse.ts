/**
 * Minimal CSV reader (RFC 4180): quoted cells, "" for a quote, commas / line breaks inside quotes,
 * CRLF or LF, a leading BOM. The delimiter is `,` or `;` (some Excel locales save with `;`), guessed from the first line.
 * Returns rows of trimmed-as-given cells; blank lines are dropped.
 */
export const parseCsv = (text: string): string[][] => {
  const source = text.replace(/^﻿/, '')
  const firstLine = source.split(/\r\n|\n|\r/, 1)[0] ?? ''
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  const endCell = () => {
    row.push(cell)
    cell = ''
  }
  const endRow = () => {
    endCell()
    if (row.some((c) => c.trim() !== '')) rows.push(row)
    row = []
  }

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      endCell()
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++
      endRow()
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length > 0) endRow()
  return rows
}
