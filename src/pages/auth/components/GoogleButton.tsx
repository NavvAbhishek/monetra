import { Button } from '@/components/ui/button'

/** "Continue with Google" / "Sign up with Google". The "G" is the design's bold blue letter. */
const GoogleButton = ({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) => (
  <Button variant="outline" size="lg" fullWidth loading={loading} onClick={onClick}>
    {!loading && (
      <span className="text-lg font-extrabold text-cat-2-strong" aria-hidden>
        G
      </span>
    )}
    {label}
  </Button>
)

export default GoogleButton
