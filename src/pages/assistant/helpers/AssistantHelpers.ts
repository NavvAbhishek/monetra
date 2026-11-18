/** Starter questions shown on an empty chat. */
export const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'Which category costs me the most this year?',
  'Compare my spending this month with last month',
  'What were my 5 biggest expenses this year?',
  'How has my monthly spending changed since 2022?',
  'How much do I spend on food per month on average?',
] as const

/** Longest question accepted. */
export const MAX_QUESTION_LENGTH = 500

export type TextBlock = { kind: 'p'; text: string } | { kind: 'list'; items: string[] }

/** The model's plain-text reply → paragraphs and "- " bullet lists (no markdown library needed). */
export const toBlocks = (text: string): TextBlock[] => {
  const blocks: TextBlock[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const bullet = line.match(/^[-*•]\s+(.*)$/)
    const last = blocks[blocks.length - 1]
    if (bullet) {
      if (last?.kind === 'list') last.items.push(bullet[1])
      else blocks.push({ kind: 'list', items: [bullet[1]] })
    } else {
      blocks.push({ kind: 'p', text: line.replace(/^#+\s*/, '') })
    }
  }
  return blocks
}

/** "a **b** c" → [{ text: 'a ', bold: false }, { text: 'b', bold: true }, …] */
export const splitBold = (text: string): { text: string; bold: boolean }[] =>
  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith('**') && part.endsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }))
