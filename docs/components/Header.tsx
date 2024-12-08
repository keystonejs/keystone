/** @jsxImportSource @emotion/react */

'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import debounce from 'lodash.debounce'

import { BREAK_POINTS } from '../lib/media'
import { useMediaQuery } from '../lib/media'
import { SearchField } from './primitives/SearchField'
import { Highlight } from './primitives/Highlight'
import { Wrapper } from './primitives/Wrapper'
import { Hamburger } from './icons/Hamburger'
import { Button } from './primitives/Button'
import { NavItem } from './docs/Navigation'
import { ThemeToggle } from './ThemeToggle'
import { Keystone } from './icons/Keystone'
import { MobileMenu } from './MobileMenu'
import { GitHub } from './icons/GitHub'
import { ArrowR } from './icons/ArrowR'
// TODO: Add in search for mobile via this button
// import { Search } from './icons/Search';

type HeaderContextType = { mobileNavIsOpen: boolean, desktopOpenState: number }
const HeaderContext = createContext<HeaderContextType>({
  mobileNavIsOpen: false,
  desktopOpenState: -1,
})
export const useHeaderContext = () => useContext(HeaderContext)

function Logo () {
  const mq = useMediaQuery()

  return (
    <div
      css={mq({
        marginRight: [0, null, null, null, '1rem'],
        marginTop: '0.1rem',
        whiteSpace: 'nowrap',
      })}
    >
      <Link
        href="/"
        css={{
          fontSize: 'var(--font-medium)',
          fontWeight: 600,
          verticalAlign: 'middle',
          transition: 'color 0.3s ease',
        }}
      >
        <Keystone
          grad="logo"
          css={{
            display: 'inline-block',
            width: '2rem',
            height: '2rem',
            margin: '0 var(--space-medium) var(--space-xsmall) 0',
            verticalAlign: 'middle',
          }}
        />
        <Highlight>Keystone 6</Highlight>
      </Link>
    </div>
  )
}

function useCurrentSection () {
  const pathname = usePathname()
  const check = (candidate: string) => pathname?.startsWith(candidate)
  if (['/updates', '/releases'].some(check)) return '/updates'
  if (['/why-keystone', '/for-'].some(check)) return '/why-keystone'
  if (['/docs'].some(check)) return '/docs'
  if (['/blog'].some(check)) return '/blog'
}

function LinkItem ({
  children,
  href,
  target,
  rel,
}: {
  children: ReactNode
  href: string
  target?: string
  rel?: string
}) {
  const mq = useMediaQuery()
  const currentSection = useCurrentSection()
  const isActive = href === currentSection

  return (
    <span css={mq({ display: ['none', 'inline'], fontWeight: 600 })}>
      <NavItem
        isActive={isActive}
        alwaysVisible
        href={href}
        target={target}
        rel={rel}
        css={{
          padding: '0 !important',
        }}
      >
        {children}
      </NavItem>
    </span>
  )
}

function useClickOutside (ref: RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside (event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        cb()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, cb])
}

function FlatMenu ({
  label,
  items = [],
}: {
  label: string
  items: Array<{ label: string, href: string }>
}) {
  const mq = useMediaQuery()
  const menuRef = useRef(null)
  const [showContent, setShowContent] = useState(false)

  const onClickHandler = useCallback(() => {
    setShowContent((b) => !b)
  }, [setShowContent])

  const closeMenu = useCallback(() => {
    if (showContent === true) {
      setShowContent(false)
    }
  }, [showContent, setShowContent])

  useClickOutside(menuRef, closeMenu)

  return (
    <div
      ref={menuRef}
      onClick={onClickHandler}
      css={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <button
        aria-haspopup
        aria-expanded={showContent}
        css={{
          display: 'flex',
          alignItems: 'center',
          height: 'auto',
          padding: 0,
          border: 'none',
          background: 'transparent',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          color: 'var(--text)',
          ':hover': {
            color: 'var(--link)',
          },
        }}
      >
        {label}
        <ArrowR
          css={{
            marginLeft: '0.25rem',
            width: '14px',
            transition: 'transform 150ms',
            ...(showContent ? { transform: 'rotate(-90deg)' } : { transform: 'rotate(90deg)' }),
            path: { strokeWidth: '0.125em' },
          }}
        />
      </button>
      <div
        data-menu-content
        css={{
          zIndex: 2,
          display: showContent ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute',
          width: 'max-content',
          padding: '1rem 1.5rem',
          marginTop: '1rem',
          border: '1px solid var(--border)',
          borderRadius: '0.25rem',
          background: 'var(--app-bg)',
          gap: '.25rem',
        }}
      >
        {items.map(({ href, label }) => {
          return (
            <span role="menu-item" key={href}>
              <span css={mq({ display: ['none', 'inline'], fontWeight: 600 })}>
                <NavItem
                  isActive={false}
                  alwaysVisible
                  href={href}
                  css={{
                    padding: '0.5rem 0 !important',
                  }}
                >
                  {label}
                </NavItem>
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
export function Header () {
  const mq = useMediaQuery()
  const router = useRouter()
  const pathname = usePathname()

  const menuRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const [mobileNavIsOpen, setMobileNavIsOpen] = useState(false)
  const [desktopOpenState, setDesktopOpenState] = useState(-1)

  useEffect(() => {
    const listener = () => {
      setMobileNavIsOpen(false)
      setDesktopOpenState(-1)
      const width = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      )
      if (width > BREAK_POINTS.sm) {
        setDesktopOpenState(-1)
      } else {
        setDesktopOpenState(-1)
      }
    }
    window.addEventListener('resize', debounce(listener, 130))

    return () => {
      window.removeEventListener('resize', debounce(listener, 130))
    }
  }, [setDesktopOpenState])

  useEffect(() => {
    document.body.style.overflow = 'auto'
    // search - init field
    const searchAttempt = 0
    // @ts-expect-error
    document.getElementById('search-field').disabled = true
    const loadSearch = (searchAttempt: number) => {
      // @ts-expect-error
      if (window.docsearch && searchAttempt < 10) {
        // @ts-expect-error
        document.getElementById('search-field').disabled = false
        // @ts-expect-error
        window.docsearch({
          appId: 'N3ZF861Q5G',
          apiKey: 'f52fa93b9068fe8824beab5727ae84a1',
          indexName: 'keystonejs',
          inputSelector: '#search-field',
          algoliaOptions: {
            facetFilters: ['tags:stable'],
          },
          transformData: (results: any) => {
            if (window.location.hostname == 'keystonejs.com') return results
            return results.map((result: object) => {
              // @ts-expect-error
              result.url = result.url.replace('https://keystonejs.com', window.location.origin)
              return result
            })
          },
        })
      } else if (searchAttempt >= 10) {
        // @ts-expect-error
        document.getElementById('search-field-container').style.visibility = 'hidden'
      } else {
        setTimeout(() => loadSearch(searchAttempt++), 500)
      }
    }
    // yoo hooo
    loadSearch(searchAttempt)
    // search - keyboard shortcut
    const keysPressed: { [key: KeyboardEvent['key']]: boolean } = {}
    document.body.addEventListener('keydown', (event) => {
      // If we're typing in an input, don't ever focus the search input
      if (
        document.activeElement &&
        ['TEXTAREA', 'INPUT'].includes(document.activeElement.nodeName)
      ) {
        return
      }

      keysPressed[event.key] = true
      if (keysPressed['Meta'] && event.key == 'k') {
        event.preventDefault()
        document.getElementById('search-field')?.focus()
      }
    })
    document.body.addEventListener('keyup', (event) => {
      delete keysPressed[event.key]
    })
  }, [])

  const handleOpen = useCallback(() => {
    setMobileNavIsOpen(true)
    document.body.style.overflow = 'hidden'
    document.getElementById('mobile-menu-close-btn')?.focus()
  }, [])

  const handleClose = useCallback(() => {
    setMobileNavIsOpen(false)
    document.body.style.overflow = 'auto'
    document.getElementById('skip-link-navigation-btn')?.focus()
  }, [])

  useEffect(() => {
    handleClose()
  }, [pathname])

  return (
    <header ref={headerRef}>
      <Wrapper
        css={mq({
          display: 'grid',
          gridTemplateColumns: [
            'auto max-content max-content max-content',
            'auto max-content max-content max-content max-content max-content max-content max-content',
            'max-content auto max-content max-content max-content max-content max-content max-content',
            'max-content auto max-content max-content max-content max-content max-content max-content max-content',
            '15rem auto max-content max-content max-content max-content max-content max-content max-content',
          ],
          gap: [
            'var(--space-medium)',
            'var(--space-large)',
            'var(--space-large)',
            'var(--space-large)',
            'var(--space-xlarge)',
          ],
          justifyItems: 'start',
          alignItems: 'center',
          paddingTop: 'var(--space-large)',
          paddingBottom: 'var(--space-large)',
          color: 'var(--muted)',
          '& a:hover': {
            color: 'var(--link)',
          },
        })}
      >
        <Logo />

        <div
          id="search-field-container"
          css={mq({
            display: ['none', null, 'block'],
            width: ['100%', null, null, null, '80%'],
          })}
        >
          <SearchField />
        </div>
        <span
          css={mq({
            display: ['none', null, 'inline-block'],
          })}
        >
          <FlatMenu
            label="About"
            items={[
              { label: 'Why Keystone', href: '/why-keystone' },
              { label: 'For Developers', href: '/for-developers' },
              { label: 'For Organisations', href: '/for-organisations' },
              { label: 'For Content Management', href: '/for-content-management' },
              { label: 'Our Roadmap', href: '/roadmap' },
              { label: 'GitHub Releases', href: 'https://github.com/keystonejs/keystone/releases' },
              { label: 'Enterprise', href: 'https://www.thinkmill.com.au/services/keystone' },
            ]}
          />
        </span>

        {/* TODO: Add in search for mobile via this button */}
        {/*
        <button
          css={mq({
            display: ['inline-block', 'inline-block', 'none'],
            appearance: 'none',
            border: '0 none',
            boxShadow: 'none',
            background: 'transparent',
            padding: '0.25rem',
            cursor: 'pointer',
            color: 'var(--muted)',
          })}
        >
          <Search css={{ height: '1.4rem', marginTop: '0.2rem' }} />
        </button>
        */}
        {/* TODO: This will be docs link once we add demo */}
        {/* <span
          css={mq({
            display: ['none', null, 'inline-block'],
          })}
        >
          <LinkItem href="/docs">Docs</LinkItem>
        </span> */}
        <span
          css={mq({
            display: ['none', null, 'inline-block'],
          })}
        >
          <LinkItem href="/blog">Blog</LinkItem>
        </span>
        <span
          css={mq({
            display: ['none', null, 'inline-block'],
          })}
        >
          <LinkItem
            href="https://www.thinkmill.com.au/services/keystone"
            target="_blank"
            rel="noreferrer"
          >
            Enterprise &#8599;
          </LinkItem>
        </span>
        <Button
          as="a"
          href="/docs"
          shadow
          css={mq({
            '&&': {
              display: ['none', null, 'inline-flex'],
            },
          })}
        >
          Docs
        </Button>
        <ThemeToggle />
        <a
          href="https://github.com/keystonejs/keystone"
          target="_blank"
          rel="noreferrer"
          css={mq({
            display: ['none', null, 'inline-flex'],
            padding: 0,
            justifyContent: 'center',
            borderRadius: '100%',
            color: 'currentColor',
            transition: 'color 0.3s ease',
            ':hover': {
              color: '#000',
            },
          })}
        >
          <GitHub css={{ height: '1.5em' }} />
        </a>
        <HeaderContext.Provider value={{ mobileNavIsOpen, desktopOpenState }}>
          <div
            ref={menuRef}
            css={mq({
              display: ['inline-block', null, 'none'],
            })}
          >
            <button
              onClick={handleOpen}
              id="skip-link-navigation-btn"
              tabIndex={0}
              css={mq({
                appearance: 'none',
                border: '0 none',
                boxShadow: 'none',
                background: 'transparent',
                padding: '0.25rem',
                cursor: 'pointer',
                color: 'var(--muted)',
              })}
            >
              <Hamburger css={{ height: '1.25rem' }} />
            </button>
            <MobileMenu handleClose={handleClose} />
          </div>
        </HeaderContext.Provider>
      </Wrapper>
    </header>
  )
}
