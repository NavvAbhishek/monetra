import { PageHeader } from '@/components/ui/page-header'
import AccountSection from './components/AccountSection'
import AppearanceSection from './components/AppearanceSection'
import DataSection from './components/DataSection'
import PastSpendingSection from './components/PastSpendingSection'
import ProfileSection from './components/ProfileSection'
import { useSettings } from './hooks/useSettings'

/** Not in the design — built from the same components and tokens (CLAUDE.md §7.3). */
const Settings = () => {
  const ctx = useSettings()
  return (
    <div className="flex max-w-3xl flex-col gap-4.5">
      <PageHeader title="Settings" description="Your profile, theme and data." />
      <ProfileSection profile={ctx.profile} isLoading={ctx.isProfileLoading} photoURL={ctx.user?.photoURL} />
      <AppearanceSection ctx={ctx} />
      <PastSpendingSection />
      <DataSection ctx={ctx} />
      <AccountSection ctx={ctx} />
    </div>
  )
}

export default Settings
