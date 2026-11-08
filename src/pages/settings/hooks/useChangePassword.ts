import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useChangePasswordMutation } from '@/queries/auth/auth-mutations'
import { errorMessage } from '@/queries/session'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/schemas/auth/authSchema'
import { isServiceError } from '@/services'
import { Notification } from '@/utils/notification'

/** Settings → Password: current password + new password (typed twice). */
export const useChangePassword = () => {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const change = useChangePasswordMutation()
  const newPassword = useWatch({ control: form.control, name: 'newPassword' })

  const onSubmit = form.handleSubmit(({ currentPassword, newPassword: next }) =>
    change.mutate(
      { currentPassword, newPassword: next },
      {
        onSuccess: () => form.reset(), // empty boxes again — nothing sensitive stays on screen
        onError: (error) => {
          // a wrong current password belongs under that field; anything else (offline…) is a toast
          if (isServiceError(error) && error.code === 'auth/wrong-password') {
            form.setError('currentPassword', { message: error.message })
          } else {
            Notification.error(errorMessage(error))
          }
        },
      },
    ),
  )

  return { form, onSubmit, newPassword, isSaving: change.isPending }
}
