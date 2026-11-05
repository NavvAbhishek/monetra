import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import type { SettingsCtx } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'

/** Log out. */
const AccountSection = ({ ctx }: { ctx: SettingsCtx }) => (
  <SettingsSection title="Account" description={ctx.user ? `Logged in as ${ctx.user.email}` : undefined}>
    <div>
      <Button variant="danger-soft" size="md" loading={ctx.isSigningOut} onClick={ctx.signOut}>
        {!ctx.isSigningOut && <Icon.LogOut aria-hidden />}
        Log out
      </Button>
    </div>
  </SettingsSection>
)

export default AccountSection
