/** @jsxImportSource @emotion/react */

import type { HTMLAttributes } from 'react'

import { Type } from '../primitives/Type'
import { type IconProps } from '../icons/util'

type CustomerCardProps = {
  icon: (props: IconProps) => JSX.Element
  title: string
  accessibleTitle?: string
} & HTMLAttributes<HTMLElement>

export function CustomerCard ({
  icon: Icon,
  accessibleTitle,
  title,
  children,
  ...props
}: CustomerCardProps) {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--app-bg)',
        padding: '2rem',
        border: '1px solid var(--border-muted)',
        borderRadius: '1rem',
        boxShadow: '0px 20px 38px -7px var(--shadow)',
        height: '100%',
      }}
      {...props}
    >
      <Icon />
      <Type as="h3" look="heading20bold" aria-label={accessibleTitle} margin="0.5rem 0 0 0">
        {title}
      </Type>
      <Type as="p" look="body18" color="var(--muted)">
        {children}
      </Type>
    </div>
  )
}
