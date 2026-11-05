import type { AuthUser } from '@/types/auth'
import type { Category, CategoryInput } from '@/types/category'
import type { Expense, ExpenseInput } from '@/types/expense'
import type { DateRange } from '@/types/period'
import type { Profile, ProfilePatch } from '@/types/profile'

/**
 * The backend contract (CLAUDE.md §3). `services/mock/*` and `services/firebase/*` implement
 * the SAME functions with the SAME signatures — pages, hooks and queries never change.
 * Functions are named <domain>_<action>. Dates are `Date`, money is integer cents.
 */

export type SignInInput = { email: string; password: string; keepLoggedIn: boolean }
export type SignUpInput = { name: string; email: string; password: string; currency: string }
export type Unsubscribe = () => void

export interface AuthService {
  auth_signIn(input: SignInInput): Promise<AuthUser>
  auth_signUp(input: SignUpInput): Promise<AuthUser>
  auth_google(): Promise<AuthUser>
  auth_resetPassword(email: string): Promise<void>
  auth_signOut(): Promise<void>
  /** Calls `callback` with the current user right away, then on every sign-in / sign-out. */
  auth_onChange(callback: (user: AuthUser | null) => void): Unsubscribe
}

export type ProfileCreateInput = Pick<Profile, 'uid' | 'name' | 'email' | 'currency'>

export interface ProfileService {
  profile_get(uid: string): Promise<Profile | null>
  /** Creates the profile + seeds the default categories. Safe to call twice (returns the existing one). */
  profile_create(input: ProfileCreateInput): Promise<Profile>
  profile_update(uid: string, patch: ProfilePatch): Promise<Profile>
}

export interface CategoriesService {
  /** Sorted by `order`. */
  category_list(uid: string): Promise<Category[]>
  category_create(uid: string, input: CategoryInput): Promise<Category>
  category_update(uid: string, id: string, input: CategoryInput): Promise<Category>
  /**
   * Throws `category/has-expenses` while expenses still use it (move them first with
   * `expense_reassignCategory`) and `category/last-category` for the only category left.
   */
  category_delete(uid: string, id: string): Promise<void>
}

export interface ExpensesService {
  /** Expenses with `range.start <= spentAt < range.end`, newest first. */
  expense_listInRange(uid: string, range: DateRange): Promise<Expense[]>
  expense_get(uid: string, id: string): Promise<Expense | null>
  expense_create(uid: string, input: ExpenseInput): Promise<Expense>
  expense_update(uid: string, id: string, input: ExpenseInput): Promise<Expense>
  expense_delete(uid: string, id: string): Promise<void>
  /** How many expenses use this category (all time). Cheap: Firestore can count without reading documents. */
  expense_countForCategory(uid: string, categoryId: string): Promise<number>
  /** Moves every expense from one category to another. Returns how many were moved. */
  expense_reassignCategory(uid: string, fromCategoryId: string, toCategoryId: string): Promise<number>
}

export interface Backend {
  auth: AuthService
  profile: ProfileService
  categories: CategoriesService
  expenses: ExpensesService
}
