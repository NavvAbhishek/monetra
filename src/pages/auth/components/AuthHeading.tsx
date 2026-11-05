import type { ReactNode } from 'react'

/** Title + subtitle at the top of every auth form (M7, M8, D5, D6). */
const AuthHeading = ({ title, description }: { title: string; description: ReactNode }) => (
  <header className="flex flex-col gap-0.5 lg:gap-1">
    <h1 className="text-4xl font-extrabold tracking-tight text-ink lg:text-5xl">{title}</h1>
    <p className="text-base text-muted-foreground lg:text-md">{description}</p>
  </header>
)

export default AuthHeading
