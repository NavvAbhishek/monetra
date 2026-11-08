import PasswordStrength from '@/components/PasswordStrength'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { PasswordInput } from '@/components/ui/password-input'
import { useChangePassword } from '../hooks/useChangePassword'
import SettingsSection from './SettingsSection'

const ChangePasswordForm = () => {
  const { form, onSubmit, newPassword, isSaving } = useChangePassword()
  const { register, formState } = form
  const { errors } = formState

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="current-password" label="Current password" error={errors.currentPassword?.message}>
        <PasswordInput
          id="current-password"
          size="md"
          autoComplete="current-password"
          {...fieldErrorProps('current-password', errors.currentPassword?.message)}
          {...register('currentPassword')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <FormField id="new-password" label="New password" error={errors.newPassword?.message}>
          <PasswordInput
            id="new-password"
            size="md"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...fieldErrorProps('new-password', errors.newPassword?.message)}
            {...register('newPassword')}
          />
          <PasswordStrength password={newPassword} />
        </FormField>
        <FormField id="confirm-new-password" label="Confirm new password" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirm-new-password"
            size="md"
            autoComplete="new-password"
            {...fieldErrorProps('confirm-new-password', errors.confirmPassword?.message)}
            {...register('confirmPassword')}
          />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="md" loading={isSaving}>
          Change password
        </Button>
      </div>
    </form>
  )
}

/** Change the login password. Google-only accounts have no Monetra password, so the page doesn't render this card for them. */
const PasswordSection = () => (
  <SettingsSection title="Password" description="Enter your current password, then choose a new one.">
    <ChangePasswordForm />
  </SettingsSection>
)

export default PasswordSection
