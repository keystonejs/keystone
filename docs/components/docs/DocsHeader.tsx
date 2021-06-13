/** @jsx jsx  */
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';

import { Wrapper } from '../primitives/Wrapper';
import { Twitter } from '../icons/Twitter';
import { GitHub } from '../icons/GitHub';
import { Slack } from '../icons/Slack';
import { Logo } from '../Logo';

export function DocsHeader() {
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
          <a
            href="https://github.com/keystonejs/keystone"
            target="_blank"
            rel="noopener noreferrer"
            css={{
              display: 'inline-flex',
              padding: 0,
              justifyContent: 'center',
              borderRadius: '100%',
              color: 'var(--muted)',
              transition: 'color 0.3s ease',
              ':hover': {
                color: '#000',
              },
            }}
          >
            <GitHub css={{ height: 'var(--space-xlarge)' }} />
          </a>

          <a
            href="https://twitter.com/keystonejs"
            target="_blank"
            rel="noopener noreferrer"
            css={{
              display: 'inline-flex',
              padding: 0,
              justifyContent: 'center',
              borderRadius: '100%',
              color: 'var(--muted)',
              transition: 'color 0.3s ease',
              ':hover': {
                color: '#1da1f2',
              },
            }}
          >
            <Twitter css={{ height: 'var(--space-xlarge)' }} />
          </a>

          <a
            href="https://community.keystonejs.com/"
            target="_blank"
            rel="noopener noreferrer"
            css={{
              display: 'inline-flex',
              padding: 0,
              justifyContent: 'center',
              borderRadius: '100%',
              '.slack-color': {
                fill: 'var(--muted)',
                transition: 'fill 0.3s ease',
              },
              '&:hover .slack-color1': {
                fill: '#e01e5a',
              },
              '&:hover .slack-color2': {
                fill: '#36c5f0',
              },
              '&:hover .slack-color3': {
                fill: '#2eb67d',
              },
              '&:hover .slack-color4': {
                fill: '#ecb22e',
              },
            }}
          >
            <Slack css={{ height: 'var(--space-xlarge)' }} />
          </a>
        </div>
      </Wrapper>
    </header>
  );
}
