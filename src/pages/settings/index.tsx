import { useIsMobile } from '@/hooks/use-mobile'
import { PageHeader } from '@/components/ui/page-header'
import AccountSection from './components/AccountSection'
import AppearanceSection from './components/AppearanceSection'
import DataSection from './components/DataSection'
import PasswordSection from './components/PasswordSection'
import PastSpendingSection from './components/PastSpendingSection'
import ProfileSection from './components/ProfileSection'
import { useSettings } from './hooks/useSettings'

/** Not in the design — built from the same components and tokens (CLAUDE.md §7.3). */
const Settings = () => {
  const ctx = useSettings()
  const isMobile = useIsMobile()
  const hasPassword = ctx.user?.hasPassword ?? true // false = Google-only account: nothing to change
  return (
    <div className="flex max-w-3xl flex-col gap-4.5 xl:max-w-7xl">
      <PageHeader title="Settings" description="Your profile, theme and data." />
      {/* One column on phones / tablets; two columns from xl (the order stays the same when stacked).
          Google-only accounts have no password card, so the cards are split differently to keep the columns even. */}
      <div className="grid items-start gap-4.5 xl:grid-cols-2">
        <div className="flex flex-col gap-4.5">
          <ProfileSection profile={ctx.profile} isLoading={ctx.isProfileLoading} photoURL={ctx.user?.photoURL} />
          {hasPassword ? <PasswordSection /> : <PastSpendingSection />}
        </div>
        <div className="flex flex-col gap-4.5">
          <AppearanceSection ctx={ctx} />
          {hasPassword && <PastSpendingSection />}
          <DataSection ctx={ctx} />
        </div>
      </div>
      {/* Desktop logs out from the sidebar profile menu; phones have no sidebar, so the card stays there. */}
      {isMobile && <AccountSection ctx={ctx} />}
    </div>
  )
}

export default Settings
