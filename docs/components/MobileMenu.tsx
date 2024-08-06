/** @jsxImportSource @emotion/react */

import Link from 'next/link'
// import { useRouter } from 'next/router';
import { Fragment, useEffect, type ReactNode, type MouseEvent } from 'react'
import FocusLock from 'react-focus-lock'

import { useHeaderContext } from './Header'
import { Highlight } from './primitives/Highlight'

import { DocsNavigation, NavItem } from './docs/Navigation'
import { Keystone } from './icons/Keystone'
import { Close } from './icons/Close'

type MobileMenuProps = {
  handleClose: (e?: MouseEvent) => void
}

export function MobileMenu ({ handleClose }: MobileMenuProps) {
  const { mobileNavIsOpen } = useHeaderContext()

  useEffect(() => {
    const handleEsc = ({ keyCode }: KeyboardEvent) => {
      if (keyCode === 27 && mobileNavIsOpen) {
        handleClose()
      }
    }

    document.body.addEventListener('keydown', handleEsc)
    return () => {
      document.body.removeEventListener('keydown', handleEsc)
    }
  }, [mobileNavIsOpen, handleClose])

  return (
    <Fragment>
      <FocusLock disabled={!mobileNavIsOpen}>
        <NavContainer mobileNavIsOpen={mobileNavIsOpen}>
          <NavHeader mobileNavIsOpen={mobileNavIsOpen} handleClose={handleClose} />
          <div
            css={{
              padding: '1rem 2rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <NavItem href="/why-keystone">Why Keystone</NavItem>

            <NavItem href="/for-developers">For Developers</NavItem>
            <NavItem href="/for-organisations">For Organisations</NavItem>
            <NavItem href="/for-content-management">For Content Management</NavItem>
            <NavItem href="/roadmap">Roadmap</NavItem>
            <NavItem href="/enterprise">For Enterprise</NavItem>
          </div>
          <div
            css={{
              padding: '1rem 2rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <NavItem href="/blog">Blog</NavItem>
            <NavItem href="https://github.com/keystonejs/keystone/releases">
              GitHub Releases
            </NavItem>
          </div>
          <div css={{ padding: '1rem 2rem 2rem' }}>
            <DocsNavigation />
          </div>
        </NavContainer>
      </FocusLock>

      <Overlay handleClose={handleClose} mobileNavIsOpen={mobileNavIsOpen} />
    </Fragment>
  )
}

type NavContainerProps = {
  children: ReactNode
  mobileNavIsOpen: boolean
}

function NavContainer ({ mobileNavIsOpen, children }: NavContainerProps) {
  return (
    <nav
      id={mobileNavIsOpen ? 'skip-link-navigation' : ''}
      tabIndex={mobileNavIsOpen ? 0 : -1}
      css={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        background: 'var(--app-bg)',
        overflow: 'auto',
        transform: mobileNavIsOpen ? 'translateX(0)' : 'translateX(100%)',
        zIndex: 100,
        transition: 'transform 0.25s ease',
        '@media (min-width: 22.5rem)': {
          width: '22.5rem',
        },
      }}
      aria-hidden={!mobileNavIsOpen}
    >
      {children}
    </nav>
  )
}

type NavHeaderProps = {
  handleClose: (e?: MouseEvent) => void
  mobileNavIsOpen: boolean
}

function NavHeader ({ handleClose, mobileNavIsOpen }: NavHeaderProps) {
  return (
    <div
      css={{
        position: 'sticky',
        display: 'grid',
        gridTemplateColumns: 'auto max-content',
        top: 0,
        padding: '0.65rem 0.75rem 0.5rem 2rem',
        marginBottom: '0.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--app-bg)',
        alignItems: 'center',
      }}
    >
      <Link
        href="/"
        tabIndex={mobileNavIsOpen ? 0 : -1}
        css={{
          fontSize: 'var(--font-medium)',
          fontWeight: 600,
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Keystone grad="logo" css={{ height: '2rem', marginRight: '0.4em' }} />
        <Highlight>Keystone 6</Highlight>
      </Link>
      <button
        id="mobile-menu-close-btn"
        onClick={handleClose}
        tabIndex={mobileNavIsOpen ? 0 : -1}
        css={{
          appearance: 'none',
          border: '0 none',
          boxShadow: 'none',
          background: 'transparent',
          padding: 'var(--space-large)',
          cursor: 'pointer',
          color: 'var(--muted)',
          justifySelf: 'end',
        }}
      >
        <Close css={{ height: '1.4rem' }} />
      </button>
    </div>
  )
}

function Overlay ({ handleClose, mobileNavIsOpen }: NavHeaderProps) {
  return (
    <div
      onClick={handleClose}
      css={
        mobileNavIsOpen
          ? {
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'black',
              opacity: '0.8',
              transition: 'opacity 0.25s ease',
              zIndex: 99,
            }
          : {
              position: 'fixed',
              top: 0,
              left: 0,
              height: 0,
              width: 0,
              overflow: 'hidden',
              opacity: 0,
            }
      }
    />
  )
}
