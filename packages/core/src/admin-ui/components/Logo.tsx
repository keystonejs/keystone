import React from 'react'
import Link from 'next/link'
import { css, tokenSchema } from '@keystar/ui/style'
import { Heading } from '@keystar/ui/typography'

import { useKeystone } from '../context'

export function Logo () {
  const { adminConfig } = useKeystone()
  if (adminConfig.components?.Logo) return <adminConfig.components.Logo />
  return <DefaultLogo />
}

function DefaultLogo () {
  return (
    <Heading
      elementType="div"
      size="small"
      UNSAFE_className={css({ lineHeight: 1 })}
    >
      <Link
        href="/"
        className={css({
          alignItems: 'center',
          color: tokenSchema.color.alias.foregroundIdle,
          display: 'flex',
          gap: tokenSchema.size.space.regular,
          outline: 0,
          textDecoration: 'underline',
          textDecorationColor: 'transparent',
          textDecorationThickness: tokenSchema.size.border.regular,
          textUnderlineOffset: tokenSchema.size.border.medium,

          '&:hover, &:focus-visible': {
            color: tokenSchema.color.alias.foregroundHovered,
            textDecorationColor: 'currentColor',
          },
          '&:focus-visible': {
            textDecorationStyle: 'double',
          },
        })}
      >
        <svg
          aria-hidden
          focusable={false}
          role="img"
          viewBox="0 0 220 220"
          xmlns="http://www.w3.org/2000/svg"
          className={css({
            fill: 'currentColor',
            height: tokenSchema.size.element.small,
            width: tokenSchema.size.element.small,
          })}
        >
          <path
            fillRule="evenodd"
            d="M290.1 47h117.5c17.8 0 24.3 1.9 30.8 5.3a36.3 36.3 0 0115.1 15.2c3.5 6.5 5.4 13 5.4 30.8v117.4c0 17.9-1.9 24.3-5.4 30.8a36.3 36.3 0 01-15.1 15.2c-6.5 3.4-13 5.3-30.8 5.3H290c-17.8 0-24.3-1.9-30.8-5.3a36.3 36.3 0 01-15.1-15.2c-3.5-6.5-5.3-13-5.3-30.8V98.3c0-17.9 1.8-24.3 5.3-30.8a36.3 36.3 0 0115.1-15.2c6.5-3.4 13-5.3 30.8-5.3zm11.8 56.8V218H327v-36.8l14.4-14.6 34.4 51.4h31.5l-49-69.1 44.7-45.1h-31.3L327 151v-47.3H302z"
            transform="translate(-238.9 -47)"
          />
        </svg>
        <span>Keystone 6</span>
      </Link>
    </Heading>
  )
}
