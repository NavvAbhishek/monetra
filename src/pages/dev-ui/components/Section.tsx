import type { ReactNode } from 'react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

type SectionProps = { title: string; description?: string; children: ReactNode }

const Section = ({ title, description, children }: SectionProps) => (
  <Card radius="table" padding="lg" className="gap-5">
    <div className="flex flex-col gap-0.5">
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </div>
    {children}
  </Card>
)

export const Row = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    {label && <p className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>}
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
)

export default Section
