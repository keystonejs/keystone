import React from 'react'
import Link from 'next/link'
import { Heading } from '@keystar/ui/typography'

export function CustomLogo() {
  return (
    <Heading>
      <Link
        href="/"
        style={{
          // TODO: we don't have colors in our design-system for this.
          backgroundImage: `linear-gradient(to right, #0ea5e9, #6366f1)`,
          backgroundClip: 'text',
          lineHeight: '1.75rem',
          color: 'transparent',
          verticalAlign: 'middle',
          transition: 'color 0.3s ease',
          textDecoration: 'none',
        }}
      >
        LegendBoulder After
      </Link>
    </Heading>
  )
}
