import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { SignInInput, SignUpInput } from '@/services/contracts'
import { Notification } from '@/utils/notification'
import { errorMessage } from '../session'

// The session itself reaches `auth.store` through the auth listener (hooks/use-auth-listener.ts).

export const useSignInMutation = () =>
  useMutation({
    mutationFn: (input: SignInInput) => API.auth.auth_signIn(input),
    onError: (error) => Notification.error(errorMessage(error)),
  })

export const useSignUpMutation = () =>
  useMutation({
    mutationFn: (input: SignUpInput) => API.auth.auth_signUp(input),
    onSuccess: (user) => Notification.success(`Welcome, ${user.name}!`),
    onError: (error) => Notification.error(errorMessage(error)),
  })

export const useGoogleSignInMutation = () =>
  useMutation({
    mutationFn: () => API.auth.auth_google(),
    onError: (error) => Notification.error(errorMessage(error)),
  })

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (email: string) => API.auth.auth_resetPassword(email),
    onSuccess: () => Notification.success('Check your email', 'If an account exists, we sent a reset link.'),
    onError: (error) => Notification.error(errorMessage(error)),
  })

/** Sets the new password from a reset link. The page shows its own success / error state, so no toast. */
export const useConfirmPasswordResetMutation = () =>
  useMutation({
    mutationFn: ({ code, password }: { code: string; password: string }) => API.auth.auth_confirmPasswordReset(code, password),
  })

/** Settings → Password. The form shows a wrong current password under its field, so only success toasts. */
export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      API.auth.auth_changePassword(currentPassword, newPassword),
    onSuccess: () => Notification.success('Password changed'),
  })

export const useSignOutMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => API.auth.auth_signOut(),
    // Another account must never see this one's cached data.
    onSuccess: () => queryClient.clear(),
    onError: (error) => Notification.error(errorMessage(error)),
  })
}
