import * as Icon from '@/components/icons'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SETTINGS_LINK } from '@/constant/navLinksData'
import { cn } from '@/lib/utils'
import { useSignOutMutation } from '@/queries/auth/auth-mutations'
import { Link } from '@/router/navigation'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Sidebar profile button (desktop). Opens a small menu: Settings, Log out.
 * Phones don't use it — the bottom tab bar has a Settings tab and Settings has a Log out card.
 */
const ProfileMenu = ({ collapsed }: { collapsed: boolean }) => {
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOutMutation()
  const name = user?.name ?? 'Account'

  return (
    <div className="border-t border-muted pt-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label={`Account menu for ${name}`}
            title={collapsed ? name : undefined}
            className={cn('h-auto w-full rounded-control py-2.5 font-normal', collapsed ? 'px-0' : 'justify-start gap-2.5 px-2 text-left')}
          >
            <Avatar name={user?.name ?? '?'} src={user?.photoURL} />
            {!collapsed && (
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-base font-semibold text-ink">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </span>
            )}
            {!collapsed && <Icon.ChevronsUpDown className="text-muted-foreground" aria-hidden />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={collapsed ? 'right' : 'top'} align={collapsed ? 'end' : 'start'} sideOffset={collapsed ? 14 : 8} className="min-w-56">
          <DropdownMenuLabel className="truncate">{user?.email ?? name}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to={SETTINGS_LINK.to}>
              <SETTINGS_LINK.icon aria-hidden />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" disabled={signOut.isPending} onSelect={() => signOut.mutate()}>
            <Icon.LogOut aria-hidden />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ProfileMenu
