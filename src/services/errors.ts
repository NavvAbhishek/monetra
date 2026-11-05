export type ServiceErrorCode =
  | 'auth/invalid-credentials'
  | 'auth/email-in-use'
  | 'auth/not-signed-in'
  | 'profile/not-found'
  | 'category/not-found'
  | 'category/has-expenses'
  | 'category/last-category'
  | 'expense/not-found'
  | 'expense/invalid'

/**
 * Error thrown by every backend (mock and Firebase) so the UI can react to `code`
 * and show `message` (already written for the user).
 */
export class ServiceError extends Error {
  readonly code: ServiceErrorCode

  constructor(code: ServiceErrorCode, message: string) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}

export const isServiceError = (error: unknown): error is ServiceError => error instanceof ServiceError
