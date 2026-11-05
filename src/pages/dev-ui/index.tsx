import ActionsSection from './components/ActionsSection'
import DisplaySection from './components/DisplaySection'
import FormsSection from './components/FormsSection'
import FoundationsSection from './components/FoundationsSection'
import OverlaysSection from './components/OverlaysSection'

/** Dev-only style guide (CLAUDE.md §6.1): every UI component and variant on one page. */
const DevUi = () => (
  <div className="min-h-svh bg-bg p-4 lg:p-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">Dev only · /dev/ui</p>
        <h1 className="text-5xl font-extrabold tracking-tight text-ink">UI style guide</h1>
        <p className="text-base text-muted-foreground">
          Tokens: src/index.css · Components: src/components/ui/
        </p>
      </header>
      <FoundationsSection />
      <ActionsSection />
      <FormsSection />
      <DisplaySection />
      <OverlaysSection />
    </div>
  </div>
)

export default DevUi
