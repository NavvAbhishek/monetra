import * as Icon from '@/components/icons'
import PageLoader from '@/components/PageLoader'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { PasswordInput } from '@/components/ui/password-input'
import { Link } from '@/router/navigation'
import AuthHeading from '../components/AuthHeading'
import PasswordStrength from '@/components/PasswordStrength'
import { useResetPassword } from './hooks/useResetPassword'

/** Opened from the link in the reset email. Not in the design — same style as the other auth screens. */
const ResetPassword = () => {
  const { form, onSubmit, password, email, isChecking, linkIsBad, isSubmitting, isDone } = useResetPassword()
  const { register, formState } = form
  const { errors } = formState

  if (isChecking) return <PageLoader />

  if (isDone) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid size-14 place-items-center rounded-fab bg-cat-1-soft text-success">
          <Icon.Check className="size-7" strokeWidth={3} aria-hidden />
        </div>
        <AuthHeading title="Password changed" description="Your password was updated. Log in with the new one." />
        <Button size="xl" fullWidth asChild>
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    )
  }

  if (linkIsBad) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid size-14 place-items-center rounded-fab bg-danger-soft text-danger">
          <Icon.TriangleAlert className="size-6" aria-hidden />
        </div>
        <AuthHeading
          title="This link doesn’t work"
          description="It has expired, was already used, or isn’t complete. Reset links work once and for one hour."
        />
        <Button size="xl" fullWidth asChild>
          <Link to="/forgot-password">Get a new link</Link>
        </Button>
        <Button variant="link" asChild className="self-center text-base">
          <Link to="/login">Back to log in</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading
        title="Choose a new password"
        description={email ? <>For <strong className="text-ink">{email}</strong>. Use at least 8 characters.</> : 'Use at least 8 characters.'}
      />

      <FormField id="reset-password" label="New password" error={errors.password?.message}>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus
          {...fieldErrorProps('reset-password', errors.password?.message)}
          {...register('password')}
        />
        <PasswordStrength password={password} />
      </FormField>

      <FormField id="reset-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          placeholder="Type it again"
          {...fieldErrorProps('reset-confirm', errors.confirmPassword?.message)}
          {...register('confirmPassword')}
        />
      </FormField>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting}>
        Change password
      </Button>
    </form>
  )
}

export default ResetPassword
