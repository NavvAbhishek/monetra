import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { isServiceError } from '@/services'
import { Link } from '@/router/navigation'

const getCopy = (error: unknown) => {
  const code = isServiceError(error) ? error.code : undefined
  if (code === 'permission-denied') {
    return {
      emoji: '🔒',
      title: 'Past spending isn’t ready yet',
      description: 'This section couldn’t open for your account right now. Give it a moment, then try again.',
    }
  }
  if (code === 'network') {
    return {
      emoji: '📡',
      title: 'You’re offline',
      description: 'Reconnect to the internet and we’ll load your past spending.',
    }
  }
  return {
    emoji: '⚠️',
    title: 'Couldn’t load your past spending',
    description: 'Something went wrong on our side. Try again in a moment.',
  }
}

/** Shown instead of the page content when the past records can't be loaded: says what happened and offers a way on. */
const PastSpendingUnavailable = ({ error, onRetry }: { error: unknown; onRetry: () => void }) => {
  const { emoji, title, description } = getCopy(error)
  return (
    <Card padding="lg" className="items-center gap-2 py-12 text-center" role="alert">
      <EmojiBox emoji={emoji} size="xl" tone="primary" />
      <h2 className="pt-3 text-2xl font-extrabold text-ink">{title}</h2>
      <p className="max-w-sm text-base text-muted-foreground">{description}</p>
      <div className="flex flex-wrap justify-center gap-2.5 pt-4">
        <Button onClick={onRetry}>Try again</Button>
        <Button asChild variant="secondary">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </Card>
  )
}

export default PastSpendingUnavailable
