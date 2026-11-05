import { useState } from 'react'
import * as Icon from '@/components/icons'
import { IconButton } from './icon-button'
import { Input, type InputProps } from './input'

export type PasswordInputProps = Omit<InputProps, 'type' | 'endAdornment'>

/** Input with a show / hide toggle (M7, M8, D5, D6). */
export const PasswordInput = (props: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <Icon.EyeOff aria-hidden /> : <Icon.Eye aria-hidden />}
        </IconButton>
      }
    />
  )
}
