/** @jsx jsx */
import { Fragment, useEffect, ElementType, HTMLAttributes, MouseEvent } from 'react';
import FocusLock from 'react-focus-lock';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useHeaderContext } from './Header';

import {
  DocsNavigation,
  UpdatesNavigation,
  MarketingNavigation,
} from './docs/Navigation';
import { WhyKeystone } from './icons/WhyKeystone';
import { Keystone } from './icons/Keystone';
import { Updates } from './icons/Updates';
import { Close } from './icons/Close';
import { Docs } from './icons/Docs';

type MobileMenuProps = {
  handleClose?: (e: MouseEvent) => void;
  releases?: any;
} & HTMLAttributes<HTMLElement>;

export function MobileMenu({ handleClose, releases, ...props }: MobileMenuProps) {
  const { open } = useHeaderContext();
  const { pathname } = useRouter();
  let ThisNav: ElementType = MarketingNavigation;
  if (pathname.startsWith('/releases') || pathname.startsWith('/updates')) {
    ThisNav = props => <UpdatesNavigation releases={releases} {...props} />;
  }
  if (pathname.startsWith('/docs')) {
    ThisNav = DocsNavigation;
  }

  useEffect(() => {
    const handleEsc = ({ keyCode }) => {
      if (keyCode === 27 && open) {
        handleClose();
      }
    };

    document.body.addEventListener('keydown', handleEsc);
    return () => {
      document.body.removeEventListener('keydown', handleEsc);
    };
  });

  return (
    <Fragment>
      <FocusLock disabled={!open}>
        <nav
          id={open ? 'skip-link-navigation' : ''}
          tabIndex={open ? 0 : -1}
          css={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            width: '100%',
            background: 'var(--app-bg)',
            overflow: 'auto',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            zIndex: 100,
            transition: 'transform 0.5s ease',
            '@media (min-width: 22.5rem)': {
              width: '22.5rem',
            },
          }}
          aria-hidden={!open}
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
              <a tabIndex={open ? 0 : -1}>
                <Keystone grad="logo" css={{ height: '2rem' }} />
              </a>
            </Link>
            <button
              id="mobile-menu-close-btn"
              onClick={handleClose}
              tabIndex={open ? 0 : -1}
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
            <Link href="/why-keystone" passHref>
              <a
                css={{
                  display: 'flex',
                  fontSize: '1rem',
                  color: 'var(--text-heading)',
                  marginBottom: '1rem',
                  alignItems: 'center',
                  fontWeight: '700',
                }}
              >
                <WhyKeystone
                  grad="grad3"
                  css={{
                    height: '1.5rem',
                    marginRight: '1rem',
                  }}
                />
                Why Keystone
              </a>
            </Link>
            <Link href="/updates" passHref>
              <a
                css={{
                  display: 'flex',
                  fontSize: '1rem',
                  color: 'var(--text-heading)',
                  marginBottom: '1rem',
                  alignItems: 'center',
                  fontWeight: '700',
                }}
              >
                <Updates
                  grad="grad1"
                  css={{
                    height: '1.5rem',
                    marginRight: '1rem',
                  }}
                />
                Updates
              </a>
            </Link>
            <Link href="/docs" passHref>
              <a
                css={{
                  display: 'flex',
                  fontSize: '1rem',
                  color: 'var(--text-heading)',
                  marginBottom: '2rem',
                  alignItems: 'center',
                  fontWeight: '700',
                }}
              >
                <Docs
                  grad="grad4"
                  css={{
                    height: '1.5rem',
                    marginRight: '1rem',
                  }}
                />
                Docs
              </a>
            </Link>
            <ThisNav />
          </div>
        </nav>
      </FocusLock>
      {open && (
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
