import { cn } from '@/lib/utils'
import { APP_NAME } from '@/routes/app.routes'

/** Short bar sliding through a soft track — the app's loading indicator (theme colour, no spinner). */
const LoadingBar = ({ className }: { className?: string }) => (
  <span className={cn('relative block h-1.5 w-40 overflow-hidden rounded-full bg-primary-soft', className)} aria-hidden>
    <span className="absolute inset-y-0 left-0 w-2/5 animate-loader-slide rounded-full bg-primary" />
  </span>
)

/**
 * Loading state. `fullScreen` (route guards, while the session is checked) shows the brand: the "$" mark
 * breathing gently, the app name and a sliding bar. Inline (a page's code loading) shows just the bar.
 * Animations stop for people who prefer reduced motion (index.css).
 */
const PageLoader = ({ fullScreen = false }: { fullScreen?: boolean }) =>
  fullScreen ? (
    <div role="status" aria-label={`Loading ${APP_NAME}`} className="grid min-h-svh place-items-center bg-bg px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="grid size-16 animate-loader-breathe place-items-center rounded-fab bg-primary text-4xl font-extrabold text-primary-foreground shadow-fab" aria-hidden>
          $
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-ink">{APP_NAME}</span>
          <span className="text-base text-muted-foreground">Getting your money in order…</span>
        </div>
        <LoadingBar />
      </div>
    </div>
  ) : (
    <div role="status" aria-label="Loading" className="grid min-h-60 place-items-center">
      <LoadingBar />
    </div>
  )

export default PageLoader
