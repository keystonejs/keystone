/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

import { Highlight } from './primitives/Highlight';
import { Wrapper } from './primitives/Wrapper';
import { DarkModeBtn } from './DarkModeBtn';
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
                fontSize: 'var(--font-medium)',
                fontWeight: 600,
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
              <Highlight>Keystone Next</Highlight>
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
          <DarkModeBtn />
        </div>
      </Wrapper>
    </header>
  );
}
