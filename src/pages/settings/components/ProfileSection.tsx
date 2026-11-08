import { Controller } from 'react-hook-form'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CURRENCIES } from '@/constant/currencies'
import type { Profile } from '@/types/profile'
import { useProfileForm } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'

const ProfileForm = ({ profile, photoURL }: { profile: Profile; photoURL?: string | null }) => {
  const { form, onSubmit, isSaving } = useProfileForm(profile)
  const { register, control, formState } = form
  const { errors, isDirty } = formState

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={profile.name} src={photoURL} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-bold text-ink">{profile.name}</span>
          <span className="truncate text-sm text-muted-foreground">{profile.email}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <FormField id="settings-name" label="Name" error={errors.name?.message}>
          <Input id="settings-name" size="md" autoComplete="name" {...fieldErrorProps('settings-name', errors.name?.message)} {...register('name')} />
        </FormField>
        <FormField id="settings-currency" label="Currency" error={errors.currency?.message} hint="Every amount is shown in this currency.">
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="settings-currency" size="md" onBlur={field.onBlur}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="md" loading={isSaving} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

/** Name + currency (currency change re-formats every amount in the app). */
const ProfileSection = ({ profile, isLoading, photoURL }: { profile?: Profile; isLoading: boolean; photoURL?: string | null }) => (
  <SettingsSection title="Profile">
    {isLoading || !profile ? (
      <div role="status" aria-label="Loading profile" className="flex flex-col gap-3">
        <Skeleton className="h-12 w-60" />
        <Skeleton className="h-11 w-full" />
      </div>
    ) : (
      <ProfileForm key={profile.uid} profile={profile} photoURL={photoURL} />
    )}
  </SettingsSection>
)

export default ProfileSection
