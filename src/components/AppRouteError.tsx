import type { ErrorComponentProps } from '@tanstack/react-router'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'

/** Root error boundary screen — shown when a route throws. */
const AppRouteError = ({ error, reset }: ErrorComponentProps) => (
  <div className="grid min-h-svh place-items-center bg-bg p-6">
    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
      <div className="grid size-14 place-items-center rounded-fab bg-danger-soft text-danger">
        <Icon.TriangleAlert className="size-6" aria-hidden />
      </div>
      <h1 className="text-2xl font-extrabold text-ink">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => window.location.assign('/')}>
          Go to dashboard
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  </div>
)

export default AppRouteError
