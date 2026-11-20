import * as Icon from '@/components/icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AssistantModelId } from '@/constant/assistantModels'
import type { AssistantCtx } from '../hooks/useAssistant'

/**
 * Which free Gemini model answers — a compact dropdown between the question box and the send button.
 * The button shows the short label ("Fast"); the list shows each model's name and description. Saved on this device.
 */
const ModelSelect = ({ ctx }: { ctx: AssistantCtx }) => {
  const current = ctx.models.find((m) => m.id === ctx.model) ?? ctx.models[0]
  return (
    <Select value={ctx.model} onValueChange={(v) => ctx.setModel(v as AssistantModelId)} disabled={ctx.isThinking}>
      <SelectTrigger
        variant="filled"
        size="md"
        aria-label={`AI model: ${current.name}`}
        title={current.description}
        className="mb-0.5 w-auto shrink-0 gap-2 bg-card shadow-panel"
      >
        <span className="flex items-center gap-1.5">
          <Icon.Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
          <SelectValue>{current.label}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent align="end" side="top">
        {ctx.models.map((m) => (
          <SelectItem key={m.id} value={m.id} className="h-auto py-2">
            <span className="flex flex-col">
              <span>
                {m.label} · {m.name}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{m.description}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ModelSelect
