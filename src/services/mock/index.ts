import type { Backend } from '../contracts'
import { authMock } from './auth.mock'
import { categoriesMock } from './categories.mock'
import { expensesMock } from './expenses.mock'
import { profileMock } from './profile.mock'

export const mockBackend: Backend = {
  auth: authMock,
  profile: profileMock,
  categories: categoriesMock,
  expenses: expensesMock,
}
