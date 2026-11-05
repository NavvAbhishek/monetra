import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSignOutMutation } from '@/queries/auth/auth-mutations'
import { useResetMockDataMutation } from '@/queries/dev/dev-mutations'
import { useExportExpensesMutation } from '@/queries/expenses/expenses-mutations'
import { useUpdateProfileMutation } from '@/queries/profile/profile-mutations'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { profileSchema, type ProfileFormValues } from '@/schemas/profile/profileSchema'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import type { Profile } from '@/types/profile'
import { DEFAULT_CURRENCY } from '@/utils/money'

/** Profile form. Rendered once the profile has loaded (see ProfileSection), so defaults are right. */
export const useProfileForm = (profile: Profile) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, currency: profile.currency },
  })
  const update = useUpdateProfileMutation()
  // After saving, the saved values become the new "clean" state (Save button disables again).
  const onSubmit = form.handleSubmit((values) => update.mutate(values, { onSuccess: () => form.reset(values) }))
  return { form, onSubmit, isSaving: update.isPending }
}

export type ProfileFormCtx = ReturnType<typeof useProfileForm>

/** Everything else on the Settings page. */
export const useSettings = () => {
  const user = useAuthStore((s) => s.user)
  const profileQuery = useGetProfileQuery()
  const themeColor = useUIStore((s) => s.themeColor)
  const setThemeColor = useUIStore((s) => s.setThemeColor)
  const exportCsv = useExportExpensesMutation()
  const signOut = useSignOutMutation()
  const resetMock = useResetMockDataMutation()
  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY

  return {
    user,
    profile: profileQuery.data ?? undefined,
    isProfileLoading: profileQuery.isPending,
    themeColor,
    setThemeColor,
    exportCsv: () => exportCsv.mutate(currency),
    isExporting: exportCsv.isPending,
    signOut: () => signOut.mutate(),
    isSigningOut: signOut.isPending,
    resetMockData: () => resetMock.mutate(),
    isResettingMock: resetMock.isPending,
  }
}

export type SettingsCtx = ReturnType<typeof useSettings>
