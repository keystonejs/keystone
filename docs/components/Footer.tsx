/** @jsx jsx */
import { jsx } from '@emotion/react';
import Link from 'next/link';
import { HTMLAttributes } from 'react';

import { useMediaQuery } from '../lib/media';
import { GitHubButton } from './primitives/GitHubButton';
import { SubscribeForm } from './SubscribeForm';
import { Wrapper } from './primitives/Wrapper';
import { Keystone } from './icons/Keystone';
import { Emoji } from './primitives/Emoji';
import { Type } from './primitives/Type';
import { Socials } from './Socials';

function List(props: HTMLAttributes<HTMLElement>) {
  return (
    <ul
      css={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        '& li': {
          margin: '0.75rem 0',
        },
        '& a': {
          color: 'var(--muted)',
        },
      }}
      {...props}
    />
  );
}

export function Footer() {
  const mq = useMediaQuery();

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
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr 1fr 1fr 1fr', null, '1fr 1fr 1fr 1fr 23rem'],
            gap: '1rem',
            borderTop: '1px solid var(--border)',
            margin: 0,
            paddingTop: '3rem',
            textAlign: ['center', 'left'],
          })}
        >
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Product
            </Type>
            <List>
              <li>
                <Link href="/why-keystone">
                  <a>Why Keystone</a>
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works">
                  <a>How it works</a>
                </Link>
              </li>
              <li>
                <Link href="/why-keystone#features">
                  <a>Features</a>
                </Link>
              </li>
              <li>
                <Link href="/why-keystone#solutions">
                  <a>Solutions</a>
                </Link>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Keystone for
            </Type>
            <List>
              <li>
                <Link href="/for-developers">
                  <a>Developers</a>
                </Link>
              </li>
              <li>
                <Link href="/for-organisations">
                  <a>Organisations</a>
                </Link>
              </li>
              <li>
                <Link href="/for-content-management">
                  <a>Content management</a>
                </Link>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Resources
            </Type>
            <List>
              <li>
                <Link href="/docs/walkthroughs/getting-started-with-create-keystone-app">
                  <a>Getting started</a>
                </Link>
              </li>
              <li>
                <Link href="/docs">
                  <a>Docs</a>
                </Link>
              </li>
              <li>
                <Link href="/docs/guides/keystone-5-vs-keystone-next">
                  <a>Guides</a>
                </Link>
              </li>
              <li>
                <Link href="/docs/examples">
                  <a>Examples</a>
                </Link>
              </li>
              <li>
                <Link href="/docs/apis/config">
                  <a>API reference</a>
                </Link>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Community
            </Type>
            <List>
              <li>
                <a
                  href="https://community.keystonejs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join our Slack
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/keystonejs/keystone/blob/master/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contribution Guide
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/keystonejs/keystone/blob/master/code-of-conduct.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code of Conduct
                </a>
              </li>
            </List>
          </div>
          <div
            css={mq({
              borderLeft: [null, null, null, '1px solid var(--border)'],
              paddingLeft: [null, null, null, '3rem'],
              gridColumn: [null, '1 / 5', null, 'inherit'],
            })}
          >
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
              margin="0 0 2rem 0"
              css={{ display: 'inline-block' }}
            >
              Keystone 6
            </Type>
            <SubscribeForm
              stacked
              css={mq({
                '& button': {
                  justifySelf: ['center', 'auto'],
                },
              })}
            >
              <p css={{ marginBottom: '1rem' }}>
                Subscribe to our mailing list to stay in the loop!
              </p>
            </SubscribeForm>
          </div>
        </div>

        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', '8.5rem 1fr 4.375rem auto'],
            gap: '1rem',
            alignItems: 'center',
            justifyItems: ['center', 'end'],
            margin: '4.5rem 0 2rem 0',
            '& p': {
              display: 'inline-block',
              margin: ['0 auto', 0],
              textAlign: 'center',
            },
          })}
        >
          <Type
            look="body14"
            as="p"
            css={{
              justifySelf: 'start',
            }}
          >
            Keystone &copy; 2021
          </Type>
          <Type look="body14" as="p" css={{ justifySelf: 'center' }}>
            Made in <Emoji symbol="🇦🇺" alt="Australia" /> by Thinkmill. Supported with{' '}
            <Emoji symbol="❤️" alt="Love" /> by the awesome Keystone community.
          </Type>
          <Socials
            css={mq({
              fontSize: '0.75rem',
              gap: '0.5rem',
              color: 'var(--muted)',
              margin: ['0 auto', 0],
            })}
          />
          <GitHubButton repo="keystonejs/keystone" />
        </div>
      </Wrapper>
    </footer>
  );
}
