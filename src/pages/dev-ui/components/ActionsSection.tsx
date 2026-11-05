import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Link } from '@/router/navigation'
import { BUTTON_SIZES, BUTTON_VARIANTS, ICON_BUTTON_VARIANTS } from '../helpers/DevUiHelpers'
import Section, { Row } from './Section'

const ActionsSection = () => (
  <Section title="Buttons" description="components/ui/button.tsx · icon-button.tsx — styles in *-variants.ts">
    {BUTTON_SIZES.map((size) => (
      <Row key={size} label={`Button · size ${size}`}>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} size={size}>
            {variant}
          </Button>
        ))}
      </Row>
    ))}
    <Row label="States & options">
      <Button>
        <Icon.Plus aria-hidden /> Add expense
      </Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button asChild variant="outline">
        <Link to="/">Link as button</Link>
      </Button>
    </Row>
    <Row label="Full width (xl)">
      <Button size="xl" fullWidth>
        Log in
      </Button>
    </Row>
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <Row key={size} label={`IconButton · size ${size}`}>
        {ICON_BUTTON_VARIANTS.map((variant) => (
          <IconButton key={variant} variant={variant} size={size} aria-label={variant}>
            {variant === 'danger-soft' ? <Icon.Trash2 aria-hidden /> : <Icon.Pencil aria-hidden />}
          </IconButton>
        ))}
      </Row>
    ))}
    <Row label="IconButton · fab (mobile +)">
      <IconButton variant="primary" size="fab" aria-label="Add expense">
        <Icon.Plus aria-hidden />
      </IconButton>
    </Row>
  </Section>
)

export default ActionsSection
