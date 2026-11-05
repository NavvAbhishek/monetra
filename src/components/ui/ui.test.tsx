import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Amount } from './amount'
import { Avatar } from './avatar'
import { Button } from './button'
import { FormField } from './form-field'
import { fieldMessageId } from './form-field-ids'
import { Input } from './input'
import { PasswordInput } from './password-input'
import { Progress } from './progress'
import { SegmentedTabs } from './segmented-tabs'
import { toneBg, toneFill, toneText } from './tone'

describe('Button', () => {
  it('is a type="button" by default and fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveAttribute('type', 'button')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
  })

  it('renders its child when asChild', () => {
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('data-slot', 'button')
  })
})

describe('SegmentedTabs', () => {
  const Harness = () => {
    const [value, setValue] = useState<'a' | 'b'>('a')
    return (
      <>
        <SegmentedTabs
          aria-label="Period"
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
        />
        <output>{value}</output>
      </>
    )
  }

  it('changes value and never deselects', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'B' }))
    expect(screen.getByRole('status')).toHaveTextContent('b')
    await userEvent.click(screen.getByRole('radio', { name: 'B' })) // click active again
    expect(screen.getByRole('status')).toHaveTextContent('b')
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked()
  })
})

describe('PasswordInput', () => {
  it('toggles visibility', async () => {
    render(<PasswordInput aria-label="Password" defaultValue="secret" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})

describe('FormField', () => {
  it('links the label and shows the error', () => {
    render(
      <FormField id="email" label="Email" error="Required">
        <Input id="email" aria-invalid aria-describedby={fieldMessageId('email')} />
      </FormField>,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAccessibleDescription('Required')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })
})

describe('Amount / Avatar / Progress', () => {
  it('formats cents', () => {
    render(<Amount cents={19450} />)
    expect(screen.getByText('$194.50')).toBeInTheDocument()
  })

  it('shows the first initial when there is no photo', () => {
    render(<Avatar name="sam perera" />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('clamps progress values', () => {
    render(<Progress value={140} label="Food" />)
    expect(screen.getByRole('progressbar', { name: 'Food' })).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('tone', () => {
  it('maps category indexes and named tones to token classes', () => {
    expect(toneBg(0)).toContain('bg-cat-0-soft')
    expect(toneBg(7)).toContain('bg-cat-1-soft') // wraps
    expect(toneBg('primary')).toBe('bg-primary-soft text-primary-hover') // AA contrast (Phase 10)
    expect(toneText(4)).toBe('text-cat-4-strong')
    expect(toneText('neutral')).toBe('text-muted-foreground')
    expect(toneFill(2)).toBe('bg-cat-2-strong')
    expect(toneFill('primary')).toBe('bg-primary')
  })
})
