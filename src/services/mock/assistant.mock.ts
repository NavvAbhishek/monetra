import { format, startOfMonth } from 'date-fns'
import type { AssistantService } from '../contracts'
import { runAssistantTool } from '../assistant/tools'
import { categoriesMock } from './categories.mock'
import { delay } from './db'
import { expensesMock } from './expenses.mock'
import { pastRecordsMock } from './pastRecords.mock'
import { profileMock } from './profile.mock'

/**
 * Mock assistant (no AI, works offline): answers every question with this month's summary from the real tools,
 * so the chat screen can be built and demoed without Firebase.
 */
export const assistantMock: AssistantService = {
  async assistant_ask(uid, { question }) {
    await delay(600)
    const now = new Date()
    const [profile, categories] = await Promise.all([profileMock.profile_get(uid), categoriesMock.category_list(uid)])
    const data = {
      currency: profile?.currency ?? 'USD',
      categories,
      listExpenses: (range: Parameters<typeof expensesMock.expense_listInRange>[1]) => expensesMock.expense_listInRange(uid, range),
      listPastRecords: () => pastRecordsMock.pastRecord_list(uid),
    }
    const result = (await runAssistantTool('get_spending_summary', { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') }, data, now)) as {
      total: { amount: string }
      byCategory?: { category: string; amount: string }[]
    }
    const top = (result.byCategory ?? []).slice(0, 3).map((c) => `- ${c.category}: ${c.amount}`)
    return [
      `Demo mode — no AI here, so I can't really answer “${question}”.`,
      `This month you've spent **${result.total.amount}**.`,
      ...(top.length ? ['Top categories:', ...top] : []),
      'Switch to the Firebase backend for real answers.',
    ].join('\n')
  },
}
