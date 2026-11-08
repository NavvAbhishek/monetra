import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Link } from '@/router/navigation'
import AuthHeading from '../components/AuthHeading'
import { useForgotPassword } from './hooks/useForgotPassword'

/** Not in the design — same style as the other auth screens. */
const ForgotPassword = () => {
  const { form, onSubmit, isSubmitting, sentTo, tryAgain } = useForgotPassword()
  const error = form.formState.errors.email?.message

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <AuthHeading title="Check your email" description={<>If an account exists for <strong className="text-ink">{sentTo}</strong>, we sent a reset link. It works once and for one hour. Check your spam folder too.</>} />
        <Button size="xl" fullWidth asChild>
          <Link to="/login">Back to log in</Link>
        </Button>
        <Button variant="link" onClick={tryAgain} className="self-center text-base">
          Use a different email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading title="Reset password" description="Enter your email and we’ll send you a link to choose a new password." />

      <FormField id="reset-email" label="Email" error={error}>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="sam@email.com"
          {...fieldErrorProps('reset-email', error)}
          {...form.register('email')}
        />
      </FormField>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting}>
        Send reset link
      </Button>

      <p className="text-center text-base text-muted-foreground">
        Remembered it?{' '}
        <Link to="/login" className="font-bold text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </form>
  )
}

export default ForgotPassword
