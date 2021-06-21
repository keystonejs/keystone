/** @jsx jsx  */
import { useState, useRef, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
import { Socials } from './Socials';

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

  const handleOpen = () => {
    setOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setOpen(false);
    document.body.style.overflow = 'auto';
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
            'auto max-content max-content',
            'max-content auto max-content max-content max-content',
            '15rem auto max-content max-content max-content',
            '10rem auto max-content max-content max-content max-content max-content max-content',
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
        <Socials
          css={mq({
            display: ['none', null, 'inline-grid'],
          })}
        />
        <div ref={menuRef}>
          <button
            onClick={handleOpen}
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
          <MobileMenu isOpen={open} releases={releases} handleClose={handleClose} />
        </div>
      </Wrapper>
    </header>
  );
}
