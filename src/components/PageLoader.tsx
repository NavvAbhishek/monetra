import * as Icon from '@/components/icons'

/** Full-area spinner shown while a lazy page loads. */
const PageLoader = () => (
  <div role="status" aria-label="Loading" className="grid min-h-60 place-items-center text-primary">
    <Icon.LoaderCircle className="size-6 animate-spin" aria-hidden />
  </div>
)

export default PageLoader
