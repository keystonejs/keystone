/** @jsxImportSource @emotion/react */

'use client'

import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import createCache from '@emotion/cache'
import Script from 'next/script'
import { Global, css } from '@emotion/react'

import { proseStyles } from '../../lib/prose-lite'
import { Theme } from '../../components/Theme'
import { NavContextProvider } from '../../components/docs/Navigation'
import { SkipLinks } from '../../components/SkipLinks'
import { createContext } from 'react'

function getTheme () {
  const isSystemColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const localStorageTheme = localStorage.theme
  if ((!localStorageTheme && isSystemColorSchemeDark) || localStorageTheme === 'dark') {
    return 'dark'
  }
  return 'light'
}

const ThemeContext = createContext({
  theme: 'light' as 'dark' | 'light',
  setTheme: (theme: 'dark' | 'light') => {},
})

export function useThemeContext () {
  return useContext(ThemeContext)
}

export function Html (props: { children: React.ReactNode}) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return getTheme()
  })
  useEffect(() => {
    const listener = () => {
      setTheme(getTheme())
    }
    const match = window.matchMedia('(prefers-color-scheme: dark)')
    match.addEventListener('change', listener)
    return () => {
      match.removeEventListener('change', listener)
    }
  }, [])
  const context = useMemo(() => ({
    theme,
    setTheme (theme:'dark' | 'light') {
      setTheme((theme) => (theme === 'dark' ? 'light' : 'dark'))
      localStorage.setItem('theme', theme)
    }
  }), [theme, setTheme])
  return <html lang="en" data-theme={theme}><ThemeContext.Provider value={context}>{props.children}</ThemeContext.Provider></html>
}

export default function RootLayoutClient ({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'my' })
    cache.compat = true
    const prevInsert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null
    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }
    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <Global
        styles={css`
          .prose {
            ${proseStyles}
          }
        `}
      />
      <Global
        styles={css`
          *,
          ::before,
          ::after {
            box-sizing: border-box;
          }
          body {
            font-size: var(--font-small);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          html,
          body {
            background: var(--app-bg);
            color: var(--text);
            height: 100%;
            font-family: var(--font-body);
            padding: 0;
            margin: 0;
            -webkit-text-size-adjust: none;
          }
          blockquote,
          dd,
          dl,
          figure,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6,
          hr,
          p,
          pre {
            margin: 0;
          }
          a {
            text-decoration: none;
            color: var(--link);
          }
          pre {
            line-height: 1.4;
            font-size: 16px;
          }
          .hint {
            border-radius: 4px;
            padding: 1rem 1rem 1rem 1.5rem;
            color: var(--text-heading);
          }
          .hint.neutral {
            background: var(--code-bg);
            border-left: 6px solid var(--text);
          }
          .hint.tip {
            background: var(--info-bg);
            border-left: 6px solid var(--info);
          }
          .hint.warn {
            background: var(--warning-bg);
            border-left: 6px solid var(--warning);
          }
          .hint.error {
            background: var(--danger-bg);
            border-left: 6px solid var(--danger);
          }
          .js-focus-visible :focus:not(.focus-visible) {
            outline: none;
          }
          *:focus-visible,
          input:focus-visible,
          button:focus-visible,
          [type='submit']:focus-visible {
            outline: 1px dashed var(--focus);
            outline-offset: 3px;
          }
          input:focus-visible {
            outline-style: solid;
            outline-width: 3px;
            outline-offset: 0;
          }
          #__next {
            min-height: 100%;
            display: grid;
            grid-template-rows: auto 1fr;
            grid-template-areas: 'header' 'main' 'footer';
            grid-template-columns: minmax(0, 1fr);
          }
        `}
      />
      <Theme />
      <NavContextProvider>
        <body>
          <SkipLinks />
          {children}
          <Script src="/assets/resize-observer-polyfill.js" />
          <Script src="/assets/focus-visible-polyfill.js" />
          <Script src="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js" />
          <Script data-no-cookie data-respect-dnt src="/sb.js" data-api="/_sb" />
        </body>
      </NavContextProvider>
    </CacheProvider>
  )
}
