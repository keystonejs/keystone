/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

import { Wrapper } from './primitives/Wrapper';
import { DarkMode } from './icons/DarkMode';
import { Logo } from './Logo';

export function Header() {
  return (
    <header>
      <Wrapper
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'start',
          paddingTop: 'var(--space-xlarge)',
          paddingBottom: 'var(--space-xlarge)',
        }}
      >
        <h2>
          <Link href="/" passHref>
            <a
              css={{
                backgroundImage: 'linear-gradient(to right, var(--grad1-1), var(--grad1-2))',
                backgroundClip: 'text',
                fontWeight: 600,
                fontSize: 'var(--font-medium)',
                lineHeight: '1.75rem',
                color: 'transparent',
                verticalAlign: 'middle',
                transition: 'color 0.3s ease',
              }}
            >
              <Logo
                css={{
                  display: 'inline-block',
                  width: '2rem',
                  height: '2rem',
                  margin: '0 var(--space-medium) var(--space-xsmall) 0',
                  verticalAlign: 'middle',
                }}
              />
              Keystone Next
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
        </h2>
        <div
          css={{
            display: 'inline-grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--space-large)',
            alignItems: 'center',
            marginLeft: 'auto',
          }}
        >
          <DarkMode css={{ height: 'var(--space-xlarge)' }} />
        </div>
      </Wrapper>
    </header>
  );
}
