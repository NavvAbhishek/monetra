import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** App-wide toast container, themed from the design tokens. */
export const Toaster = (props: ToasterProps) => (
  <Sonner
    position="top-center"
    closeButton
    style={
      {
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius-panel)',
        fontFamily: 'var(--font-sans)',
      } as CSSProperties
    }
    {...props}
  />
)
