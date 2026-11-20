import type { Backend } from '../contracts'
import { assistantFirebase } from './assistant.service'
import { authFirebase } from './auth.service'
import { categoriesFirebase } from './categories.service'
import { expensesFirebase } from './expenses.service'
import { pastRecordsFirebase } from './pastRecords.service'
import { profileFirebase } from './profile.service'

export const firebaseBackend: Backend = {
  auth: authFirebase,
  profile: profileFirebase,
  categories: categoriesFirebase,
  expenses: expensesFirebase,
  assistant: assistantFirebase,
  pastRecords: pastRecordsFirebase,
}
