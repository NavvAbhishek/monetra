import type { ComponentProps } from 'react'
import { Link } from '@/router/navigation'

type AuthSwitchLinkProps = { prompt: string; to: ComponentProps<typeof Link>['to']; action: string }

/** "New here? Create an account" / "Already have an account? Log in". */
const AuthSwitchLink = ({ prompt, to, action }: AuthSwitchLinkProps) => (
  <p className="pt-1 text-center text-base text-muted-foreground">
    {prompt}{' '}
    <Link to={to} className="font-bold text-primary hover:text-primary-hover">
      {action}
    </Link>
  </p>
)

export default AuthSwitchLink
