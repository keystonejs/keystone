/** @jsx jsx */
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import { Fragment } from 'react';
import Link from 'next/link';

import {
  Section,
  NavItem,
  DocsNavigation,
  UpdatesNavigation,
  MarketingNavigation,
} from './docs/Navigation';
import { Keystone } from './icons/Keystone';
import { Close } from './icons/Close';

export function MobileMenu({ isOpen, handleClose, position, releases, ...props }) {
  const { pathname } = useRouter();
  let ThisNav = MarketingNavigation;
  if (pathname.startsWith('/releases') || pathname.startsWith('/updates')) {
    ThisNav = props => <UpdatesNavigation releases={releases} {...props} />;
  }
  if (pathname.startsWith('/docs')) {
    ThisNav = DocsNavigation;
  }

  return (
    <Fragment>
      <nav
        css={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          width: '100%',
          background: 'var(--app-bg)',
          overflow: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 100,
          transition: 'transform 0.5s ease',
          '@media (min-width: 22.5rem)': {
            width: '22.5rem',
          },
        }}
        aria-hidden={!isOpen}
        {...props}
      >
        <div
          css={{
            position: 'sticky',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            top: 0,
            padding: '0.5rem 2rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--app-bg)',
            alignItems: 'center',
          }}
        >
          <Link href="/">
            <a tabIndex={isOpen ? 0 : -1}>
              <Keystone grad="logo" css={{ height: '2rem' }} />
            </a>
          </Link>
          <button
            onClick={handleClose}
            tabIndex={isOpen ? 0 : -1}
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
            <Close css={{ height: '1rem' }} />
          </button>
        </div>
        <div
          css={{
            padding: '2rem',
          }}
        >
          <Section label="Tutorials">
            <NavItem href="/why-keystone" isOpen={isOpen}>
              Why Keystone
            </NavItem>
            <NavItem href="/updates" isOpen={isOpen}>
              Updates
            </NavItem>
            <NavItem href="/docs" isOpen={isOpen}>
              Docs
            </NavItem>
          </Section>
          <ThisNav isOpen={isOpen} />
        </div>
      </nav>
      {isOpen && (
        <div
          onClick={handleClose}
          css={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99,
          }}
        />
      )}
    </Fragment>
  );
}
