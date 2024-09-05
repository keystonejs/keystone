/** @jsxImportSource @emotion/react */

import { type InputHTMLAttributes } from 'react'
import { Stack } from './Stack'
import { Type } from './Type'

export const Field = ({
  label,
  id,
  disabled,
  type = 'text',
  size = 'medium',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> & {
  label?: string
  id?: string
  size?: 'medium' | 'large'
}) => {
  const isTextarea = type === 'comments'
  const TextInput = isTextarea ? 'textarea' : 'input'
  const isMedium = size === 'medium'

  return (
    <Stack
      css={{
        width: '100%',
      }}
    >
      {label && (
        <Type look="body18" as="label" htmlFor={id}>
          {label}
        </Type>
      )}

      <TextInput
        type={type}
        id={id}
        css={{
          appearance: 'none',
          backgroundColor: 'var(--app-bg)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text)',
          fontSize: isMedium ? '1rem' : '1.125rem',
          fontWeight: 400,
          outline: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          textAlign: 'inherit',
          width: '100%',
          height: isMedium ? '2.5rem' : '3.125rem',
          lineHeight: 1,
          paddingBottom: 0,
          paddingTop: 0,
          boxShadow: '0 0 0 2px transparent',
          transition: 'border 0.1s ease, box-shadow 0.1s ease',
          ...(isTextarea && {
            fontFamily: 'inherit',
            paddingTop: isMedium ? '0.75rem' : '1rem',
            height: '8rem',
          }),
          ':hover': {
            borderColor: 'var(--brand-bg)',
          },
          ':focus': {
            borderColor: 'var(--focus)',
            boxShadow: '0 0 0 2px var(--focus)',
          },
          ':disabled': {
            cursor: 'not-allowed',
            background: 'var(--border)',
            color: 'var(--code)',
            pointerEvents: 'none',
          },
          '::placeholder': {
            color: 'var(--muted)',
          },
        }}
        aria-disabled={disabled ? true : undefined}
        disabled={disabled}
        {...props}
      />
    </Stack>
  )
}

Field.displayName = 'Field'
