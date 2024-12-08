/** @jsxImportSource @emotion/react */

import { Fragment, useState, useEffect, type HTMLAttributes } from 'react'

import { type COLORS } from '../lib/TOKENS'
import { LightMode } from './icons/LightMode'
import { DarkMode } from './icons/DarkMode'
import { useThemeContext } from '../app/(site)/layout-client'

export function ThemeToggle (props: HTMLAttributes<HTMLButtonElement>) {
  /*
    We don't want to render the toggle during server rendering
    because Next will always server render the light mode toggle and hydrate the light mode toggle
    even if the theme is dark mode based on system preference.
    So we render the toggle only on the client
  */

  const theme = useThemeContext()
  return (
    <Fragment>
      <button
        onClick={() => {
          theme.setTheme(theme.theme === 'dark' ? 'light' : 'dark')
        }}
        css={{
          display: 'inline-flex',
          appearance: 'none',
          background: 'transparent',
          boxShadow: 'none',
          border: '0 none',
          borderRadius: '100%',
          lineHeight: 1,
          padding: 0,
          margin: 0,
          color: 'var(--muted)',
          cursor: 'pointer',
          transition: 'color 0.3s ease',
          '&:hover, &:focus': {
            color: 'var(--link)',
          },
        }}
        {...props}
      >
        <LightMode
          css={{
            height: 'var(--space-xlarge)',
            '[data-theme="light"] &': { display: 'none' }
          }}
        />
        <DarkMode
          css={{
            height: 'var(--space-xlarge)',
            '[data-theme="dark"] &': { display: 'none' }
          }}
        />
      </button>
    </Fragment>
  )
}
