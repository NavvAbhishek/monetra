import { splitBold, toBlocks } from '../helpers/AssistantHelpers'

const Inline = ({ text }: { text: string }) => (
  <>
    {splitBold(text).map((part, i) =>
      part.bold ? (
        <strong key={i} className="font-bold">
          {part.text}
        </strong>
      ) : (
        <span key={i}>{part.text}</span>
      ),
    )}
  </>
)

/** The assistant's reply: paragraphs, "- " lists and **bold** (rendered as text — never as HTML). */
const AssistantText = ({ text }: { text: string }) => (
  <div className="flex flex-col gap-2">
    {toBlocks(text).map((block, i) =>
      block.kind === 'p' ? (
        <p key={i}>
          <Inline text={block.text} />
        </p>
      ) : (
        <ul key={i} className="flex list-disc flex-col gap-1 pl-5">
          {block.items.map((item, j) => (
            <li key={j}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      ),
    )}
  </div>
)

export default AssistantText
