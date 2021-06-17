/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { SubscribeForm } from './SubscribeForm';
import { Wrapper } from './primitives/Wrapper';
import { Keystone } from './icons/Keystone';
import { Emoji } from './primitives/Emoji';
import { Type } from './primitives/Type';

export function Footer() {
  return (
    <footer
      css={{
        gridArea: 'footer',
        padding: '1rem 0',
        zIndex: 2,
        color: 'var(--muted)',
      }}
    >
      <Wrapper>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 22.5rem',
            gap: '1rem',
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-xlarge)',
          }}
        >
          <div>
            <Keystone
              css={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                margin: '0 var(--space-medium) var(--space-xsmall) 0',
                verticalAlign: 'middle',
              }}
            />
            <Type
              as="h3"
              look="heading20bold"
              color="var(--muted)"
              css={{ display: 'inline-block' }}
            >
              Keystone Next
            </Type>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              What is Keystone
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '0 0 2rem 0',
                padding: 0,
                '& li': {
                  margin: '0.75rem 0',
                },
                '& a': {
                  color: 'var(--muted)',
                },
              }}
            >
              <li>
                <Link href="/why-keystone">
                  <a>Why Keystone</a>
                </Link>
              </li>
              <li>
                <Link href="/for-developers">
                  <a>For Developers</a>
                </Link>
              </li>
              <li>
                <Link href="/for-designers">
                  <a>For Designers</a>
                </Link>
              </li>
              <li>
                <Link href="/for-content-management">
                  <a>For Content Management</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Docs
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '0 0 2rem 0',
                padding: 0,
                '& li': {
                  margin: '0.75rem 0',
                },
                '& a': {
                  color: 'var(--muted)',
                },
              }}
            >
              <li>
                <Link href="/why-keystone">
                  <a>TODO</a>
                </Link>
              </li>
              <li>
                <Link href="/for-developers">
                  <a>TODO</a>
                </Link>
              </li>
              <li>
                <Link href="/for-designers">
                  <a>TODO</a>
                </Link>
              </li>
              <li>
                <Link href="/for-content-management">
                  <a>TODO</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <SubscribeForm>
              <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
                Stay connected
              </Type>
              <p css={{ marginBottom: '1rem' }}>
                Subscribe to our mailing list to stay in the loop!
              </p>
            </SubscribeForm>
          </div>
        </div>

        <div
          css={{
            textAlign: 'center',
            maxWidth: '21.25rem',
            margin: '1.5rem auto 2rem auto',
          }}
        >
          <Type look="body14" as="p">
            Made in <Emoji symbol="🇦🇺" alt="Australia" /> by Thinkmill. Supported with{' '}
            <Emoji symbol="❤️" alt="Love" /> by the awesome Keystone community.
          </Type>
          <Type look="body14" as="p" css={{ marginTop: '1rem' }}>
            Keystone &copy; 2021
          </Type>
        </div>
      </Wrapper>
    </footer>
  );
}
