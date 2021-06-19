/** @jsx jsx  */
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { SearchField } from './primitives/SearchField';
import { Highlight } from './primitives/Highlight';
import { Wrapper } from './primitives/Wrapper';
import { Hamburger } from './icons/Hamburger';
import { Button } from './primitives/Button';
import { DarkModeBtn } from './DarkModeBtn';
import { Keystone } from './icons/Keystone';
import { Socials } from './Socials';

function LinkItem({ name, link }) {
  const mq = useMediaQuery();
  const router = useRouter();

  return (
    <span
      css={mq({
        display: ['none', null, null, 'inline'],
        '& a': {
          color: router.pathname === link ? 'var(--link)' : 'var(--muted)',
        },
      })}
    >
      <Link href={link}>
        <a>{name}</a>
      </Link>
    </span>
  );
}

export function Header() {
  const mq = useMediaQuery();

  return (
    <header
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
            null,
            'max-content auto max-content max-content max-content max-content max-content max-content',
          ],
          gap: '1rem',
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
        <div
          css={mq({
            display: ['none', 'block'],
            width: ['100%', null, null, null, '80%'],
          })}
        >
          <SearchField />
        </div>
        <LinkItem name="Why Keystone" link="/why-keystone" />
        <LinkItem name="Updates" link="/updates" />
        <LinkItem name="Docs" link="/docs" />
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
        <button
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
      </Wrapper>
    </header>
  );
}
