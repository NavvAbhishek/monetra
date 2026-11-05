import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import ColourPicker from '@/components/CategoryForm/components/ColourPicker'
import EmojiPicker from '@/components/CategoryForm/components/EmojiPicker'
import type { CategoryFormCtx } from '@/components/CategoryForm/hooks/useCategoryForm'
import { EmojiBox } from '@/components/ui/emoji-box'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_CATEGORY_NAME_LENGTH } from '@/constant/defaultCategories'

/** Submit buttons live outside the form (panel footer / screen footer) and point here. */
export const CATEGORY_FORM_ID = 'category-form'

export type CategoryFormProps = {
  /** From `useCategoryForm` — the wrapper owns it so its submit button can show `isSaving`. */
  ctx: CategoryFormCtx
  /** panel = desktop side panel (D4) · screen = mobile full screen (M5). */
  layout: 'panel' | 'screen'
  /** Beside the emoji preview in the panel, e.g. "18 expenses this month · $326.40". */
  stats?: ReactNode
}

/** Name + colour + emoji fields with a live preview. Shared by M5 and D4 (CLAUDE.md §3). */
const CategoryForm = ({ ctx, layout, stats }: CategoryFormProps) => {
  const { form, onSubmit, preview } = ctx
  const { register, control, formState } = form
  const { errors } = formState
  const isScreen = layout === 'screen'

  return (
    <form id={CATEGORY_FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {isScreen ? (
        <EmojiBox emoji={preview.emoji} tone={preview.colourIndex} size="2xl" className="mx-auto mt-2" />
      ) : (
        <div className="flex items-center gap-3.5">
          <EmojiBox emoji={preview.emoji} tone={preview.colourIndex} size="xl" />
          <div className="flex min-w-0 flex-col">{stats ?? <span className="text-base text-muted-foreground">New category</span>}</div>
        </div>
      )}

      <FormField id="category-name" label="Name" labelVariant="strong" error={errors.name?.message}>
        <Input
          id="category-name"
          autoComplete="off"
          maxLength={MAX_CATEGORY_NAME_LENGTH + 10}
          placeholder="e.g. Pets"
          size={isScreen ? 'lg' : 'md'}
          {...fieldErrorProps('category-name', errors.name?.message)}
          {...register('name')}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <Label variant="strong">Colour</Label>
        <Controller
          control={control}
          name="colourIndex"
          render={({ field }) => (
            <ColourPicker
              value={field.value}
              onChange={field.onChange}
              size={isScreen ? 'md' : 'sm'}
              surface={isScreen ? 'bg' : 'card'}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label variant="strong">Emoji</Label>
        <Controller
          control={control}
          name="emoji"
          render={({ field }) => (
            <EmojiPicker value={field.value} onChange={field.onChange} surface={isScreen ? 'screen' : 'panel'} />
          )}
        />
        {errors.emoji?.message && (
          <p role="alert" className="text-xs font-semibold text-danger">
            {errors.emoji.message}
          </p>
        )}
      </div>
    </form>
  )
}

export default CategoryForm
