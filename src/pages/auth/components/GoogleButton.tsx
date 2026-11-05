import googleG from '@/assets/brand/google-g.svg'
import { Button } from '@/components/ui/button'

/**
 * "Continue with Google" / "Sign up with Google" with the official multi-colour Google "G"
 * (a brand asset — its colours are fixed by Google and never follow the app theme).
 */
const GoogleButton = ({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) => (
  <Button variant="outline" size="lg" fullWidth loading={loading} onClick={onClick}>
    {!loading && <img src={googleG} alt="" aria-hidden className="size-5" />}
    {label}
  </Button>
)

export default GoogleButton
