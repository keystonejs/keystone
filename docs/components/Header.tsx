/** @jsx jsx  */
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { SearchField } from './primitives/SearchField';
import { Highlight } from './primitives/Highlight';
import { Wrapper } from './primitives/Wrapper';
import { Hamburger } from './icons/Hamburger';
import { Button } from './primitives/Button';
import { NavItem } from './docs/Navigation';
import { DarkModeBtn } from './DarkModeBtn';
import { Keystone } from './icons/Keystone';
import { MobileMenu } from './MobileMenu';
import { GitHub } from './icons/GitHub';
import { Search } from './icons/Search';

const HeaderContext = createContext();
export const useHeaderContext = () => useContext(HeaderContext);

function Logo() {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        marginRight: [0, null, null, null, '2rem'],
      })}
    >
      <Link href="/" passHref>
        <a
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
        </a>
      </Link>
      <span
        css={{
          display: 'inline-block',
          padding: '0 var(--space-xsmall)',
          borderRadius: '0.25rem',
          background: 'var(--code-bg)',
          color: 'var(--code)',
          border: '1px solid var(--border)',
          fontSize: 'var(--font-xxsmall)',
          fontWeight: 400,
          lineHeight: '1rem',
          marginLeft: 'var(--space-medium)',
        }}
      >
        preview
      </span>
    </div>
  );
}

function useCurrentSection() {
  const { pathname } = useRouter();
  const check = (candidate: string) => pathname.startsWith(candidate);
  if (['/updates', '/releases'].some(check)) return '/updates';
  if (['/why-keystone', '/for-'].some(check)) return '/why-keystone';
  if (['/docs'].some(check)) return '/docs';
}

function LinkItem({ children, href }: { children: ReactNode; href: string }) {
  const mq = useMediaQuery();
  const currentSection = useCurrentSection();
  const isActive = href === currentSection;

  return (
    <span css={mq({ display: ['none', null, null, 'inline'] })}>
      <NavItem isActive={isActive} href={href}>
        {children}
      </NavItem>
    </span>
  );
}

type HeaderProps = {
  releases?: any;
};

export function Header({ releases }: HeaderProps) {
  const mq = useMediaQuery();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  const handleOpen = () => {
    setOpen(true);
    document.body.style.overflow = 'hidden';
    document.getElementById('mobile-menu-close-btn').focus();
  };

  const handleClose = () => {
    setOpen(false);
    document.body.style.overflow = 'auto';
    document.getElementById('skip-link-navigation-btn').focus();
  };

  return (
    <header
      ref={headerRef}
      css={{
        marginBottom: '2.5rem',
      }}
    >
      <Wrapper
        css={mq({
          display: 'grid',
          gridTemplateColumns: [
            'auto max-content max-content max-content',
            'max-content auto max-content max-content max-content',
            '15rem auto max-content max-content max-content',
            '15rem auto max-content max-content max-content max-content max-content max-content',
          ],
          gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
          justifyItems: 'start',
          alignItems: 'center',
          paddingTop: 'var(--space-xlarge)',
          paddingBottom: 'var(--space-xlarge)',
          color: 'var(--muted)',
          '& a:hover': {
            color: 'var(--link)',
          },
        })}
      >
        <Logo />
        <div
          css={mq({
            display: ['none', 'block'],
            width: ['100%', null, null, null, '80%'],
          })}
        >
          <SearchField />
        </div>
        <LinkItem href="/why-keystone">Why Keystone</LinkItem>
        <LinkItem href="/updates">Updates</LinkItem>
        <LinkItem href="/docs">Docs</LinkItem>
        <button
          css={mq({
            display: ['inline-block', 'none'],
            appearance: 'none',
            border: '0 none',
            boxShadow: 'none',
            background: 'transparent',
            padding: '0.25rem',
            cursor: 'pointer',
            color: 'var(--muted)',
          })}
        >
          <Search css={{ height: '1.25rem' }} />
        </button>
        <DarkModeBtn />
        <Button
          as="a"
          href="/docs"
          css={mq({
            '&&': {
              display: ['none', 'inline-flex'],
            },
          })}
        >
          Get Started
        </Button>
        <a
          href="https://github.com/keystonejs/keystone"
          target="_blank"
          rel="noopener noreferrer"
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
        <HeaderContext.Provider value={{ open }}>
          <div ref={menuRef}>
            <button
              onClick={handleOpen}
              id="skip-link-navigation-btn"
              tabIndex="0"
              css={mq({
                display: ['inline-block', null, 'none'],
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
            <MobileMenu releases={releases} handleClose={handleClose} />
          </div>
        </HeaderContext.Provider>
      </Wrapper>
    </header>
  );
}
