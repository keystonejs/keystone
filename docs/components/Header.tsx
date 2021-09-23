/** @jsx jsx  */
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Link from 'next/link';
import debounce from 'lodash.debounce';

import { BREAK_POINTS } from '../lib/media';
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
// TODO: Add in search for mobile via this button
// import { Search } from './icons/Search';

type HeaderContextType = { mobileNavIsOpen: boolean; desktopOpenState: number };
const HeaderContext = createContext<HeaderContextType>({
  mobileNavIsOpen: false,
  desktopOpenState: -1,
});
export const useHeaderContext = () => useContext(HeaderContext);

function Logo() {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        marginRight: [0, null, null, null, '1rem'],
        marginTop: '0.1rem',
        whiteSpace: 'nowrap',
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
    <span css={mq({ display: ['none', 'inline'], fontWeight: 600 })}>
      <NavItem
        isActive={isActive}
        alwaysVisible
        href={href}
        css={{
          padding: '0 !important',
        }}
      >
        {children}
      </NavItem>
    </span>
  );
}

export function Header() {
  const mq = useMediaQuery();
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const [mobileNavIsOpen, setMobileNavIsOpen] = useState(false);
  const [desktopOpenState, setDesktopOpenState] = useState(-1);

  useEffect(() => {
    const listener = () => {
      setMobileNavIsOpen(false);
      setDesktopOpenState(-1);
      const width = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      );
      if (width > BREAK_POINTS.sm) {
        setDesktopOpenState(-1);
      } else {
        setDesktopOpenState(-1);
      }
    };
    window.addEventListener('resize', debounce(listener, 130));

    return () => {
      window.removeEventListener('resize', debounce(listener, 130));
    };
  }, [setDesktopOpenState]);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    // search - init field
    let searchAttempt = 0;
    // @ts-ignore
    document.getElementById('search-field').disabled = true;
    const loadSearch = (searchAttempt: number) => {
      // @ts-ignore
      if (window.docsearch && searchAttempt < 10) {
        // @ts-ignore
        document.getElementById('search-field').disabled = false;
        // @ts-ignore
        window.docsearch({
          apiKey: '211e94c001e6b4c6744ae72fb252eaba',
          indexName: 'keystonejs',
          inputSelector: '#search-field',
          algoliaOptions: {
            facetFilters: ['tags:stable'],
          },
        });
      } else if (searchAttempt >= 10) {
        // @ts-ignore
        document.getElementById('search-field-container').style.visibility = 'hidden';
      } else {
        setTimeout(() => loadSearch(searchAttempt++), 500);
      }
    };
    loadSearch(searchAttempt);
    // search - keyboard shortcut
    let keysPressed = {};
    document.body.addEventListener('keydown', event => {
      // @ts-ignore
      keysPressed[event.key] = true;
      // @ts-ignore
      if (keysPressed['Meta'] && event.key == 'k') {
        event.preventDefault();
        document.getElementById('search-field')?.focus();
      }
    });
    document.body.addEventListener('keyup', event => {
      // @ts-ignore
      delete keysPressed[event.key];
    });
  }, []);

  const handleOpen = useCallback(() => {
    setMobileNavIsOpen(true);
    document.body.style.overflow = 'hidden';
    document.getElementById('mobile-menu-close-btn')?.focus();
  }, []);

  const handleClose = useCallback(() => {
    setMobileNavIsOpen(false);
    document.body.style.overflow = 'auto';
    document.getElementById('skip-link-navigation-btn')?.focus();
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', handleClose);
    return () => {
      router.events.off('routeChangeComplete', handleClose);
    };
  }, [router.events, handleClose]);

  return (
    <header ref={headerRef}>
      <Wrapper
        css={mq({
          display: 'grid',
          gridTemplateColumns: [
            'auto max-content max-content max-content',
            'auto max-content max-content max-content max-content max-content max-content',
            'max-content auto max-content max-content max-content max-content max-content',
            'max-content auto max-content max-content max-content max-content max-content max-content',
            '15rem auto max-content max-content max-content max-content max-content max-content',
          ],
          gap: [
            'var(--space-medium)',
            'var(--space-large)',
            'var(--space-medium)',
            'var(--space-large)',
            'var(--space-xlarge)',
          ],
          justifyItems: 'start',
          alignItems: 'center',
          paddingTop: 'var(--space-xlarge)',
          paddingBottom: 'var(--space-xlarge)',
          color: 'var(--muted)',
          '& a:hover': {
            color: 'var(--link)',
          },
          marginBottom: '2rem',
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

        <LinkItem href="/why-keystone">Why Keystone</LinkItem>
        <LinkItem href="/updates">Updates</LinkItem>

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
        <Button
          as="a"
          href="/docs"
          shadow
          css={mq({
            '&&': {
              display: ['none', null, null, 'inline-flex'],
            },
          })}
        >
          Documentation
        </Button>
        <DarkModeBtn />
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
  );
}
