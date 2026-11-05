import type { ReactNode } from 'react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

/** A titled card on the Settings page. */
const SettingsSection = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <Card radius="table" padding="lg" className="gap-4">
    <div className="flex flex-col gap-0.5">
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </div>
    {children}
  </Card>
)

export default SettingsSection
