import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'

/** Spinner shown while a lazy page loads. `fullScreen` centres it in the whole viewport. */
const PageLoader = ({ fullScreen = false }: { fullScreen?: boolean }) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn('grid place-items-center text-primary', fullScreen ? 'min-h-svh bg-bg' : 'min-h-60')}
  >
    <Icon.LoaderCircle className="size-6 animate-spin" aria-hidden />
  </div>
)

export default PageLoader
