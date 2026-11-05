import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Link } from '@/router/navigation'
import SettingsSection from './SettingsSection'

/** Entry point to Past spending (the only way there on mobile — the tab bar is full). */
const PastSpendingSection = () => (
  <SettingsSection
    title="Past spending"
    description="Moved from another app? Add what you spent before Monetra and see your all-time total. It never appears on your dashboard."
  >
    <div>
      <Button asChild variant="outline" size="md">
        <Link to="/past-spending">
          <Icon.History aria-hidden />
          Open past spending
        </Link>
      </Button>
    </div>
  </SettingsSection>
)

export default PastSpendingSection
