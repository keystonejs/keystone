/** @jsxImportSource @emotion/react */

import Link from 'next/link'
import { type HTMLAttributes } from 'react'

import { useMediaQuery } from '../lib/media'
import { GitHubButton } from './primitives/GitHubButton'
import { SubscribeForm } from './SubscribeForm'
import { Wrapper } from './primitives/Wrapper'
import { Keystone } from './icons/Keystone'
import { Emoji } from './primitives/Emoji'
import { Type } from './primitives/Type'
import { Socials } from './Socials'

function List (props: HTMLAttributes<HTMLElement>) {
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
          lineHeight: 1.4,
        },
      }}
      {...props}
    />
  )
}

export function Footer () {
  const mq = useMediaQuery()

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
            gap: '1.5rem',
            borderTop: '1px solid var(--border)',
            margin: 0,
            paddingTop: '3rem',
            textAlign: ['center', 'left'],
          })}
        >
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              About Keystone
            </Type>
            <List>
              <li>
                <Link href="/why-keystone">Our Story</Link>
              </li>
              <li>
                <Link href="/for-developers">For Developers</Link>
              </li>
              <li>
                <Link href="/for-organisations">For Organisations</Link>
              </li>
              <li>
                <Link href="/for-content-management">For Content management</Link>
              </li>
              <li>
                <Link href="https://www.thinkmill.com.au/services/keystone" target="_blank" rel="noreferrer">For Enterprise &#8599;</Link>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Resources
            </Type>
            <List>
              <li>
                <Link href="/docs/getting-started">Getting started</Link>
              </li>
              <li>
                <Link href="/docs">Docs</Link>
              </li>
              <li>
                <Link href="/docs/guides">Guides</Link>
              </li>
              <li>
                <Link href="/docs/apis">API reference</Link>
              </li>
              <li>
                <Link href="/branding">Branding</Link>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Community
            </Type>
            <List>
              <li>
                <a href="https://github.com/keystonejs/keystone" target="_blank" rel="noreferrer">
                  Keystone on GitHub
                </a>
              </li>
              <li>
                <a href="https://community.keystonejs.com/" target="_blank" rel="noreferrer">
                  Join our Slack
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/keystonejs/keystone/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Contribution Guide
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/keystonejs/keystone/blob/main/CODE-OF-CONDUCT.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Code of Conduct
                </a>
              </li>
            </List>
          </div>
          <div>
            <Type as="h3" look="heading20bold" color="var(--muted)" margin="0 0 1rem 0">
              Updates
            </Type>
            <List>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/roadmap">Roadmap</Link>
              </li>
              <li>
                <Link href="/releases">Release Notes</Link>
              </li>
            </List>
          </div>
          <div
            css={mq({
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
            gridTemplateColumns: ['1fr', '1fr 4.375rem auto'],
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
          {/* <Type
            look="body14"
            as="p"
            css={{
              justifySelf: 'start',
            }}
          >
            Keystone &copy; Thinkmill Labs Pty Ltd 2021
          </Type> */}
          <Type look="body14" as="p" css={{ justifySelf: 'start' }}>
            Made in Australia <Emoji symbol="🇦🇺" alt="Australia" /> by{' '}
            <a
              href="https://www.thinkmill.com.au?utm_source=keystone-site"
              target="_blank"
              rel="noreferrer"
            >
              Thinkmill
            </a>
            . Contributed to around the world <Emoji symbol="🌏" alt="Globe" />
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
  )
}

export function DocsFooter () {
  const mq = useMediaQuery()

  return (
    <footer
      css={{
        borderTop: '1px solid var(--border)',
        gridArea: 'footer',
        padding: '1rem 0',
        zIndex: 2,
        color: 'var(--muted)',
        gridColumn: '2 / 3',
        gridRow: '2 / 3',
      }}
    >
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 4.375rem auto'],
          gap: '1rem',
          alignItems: 'center',
          justifyItems: ['center', 'end'],
          margin: '1rem 0 1rem 0',
          '& p': {
            display: 'inline-block',
            margin: ['0 auto', 0],
            // textAlign: 'center',
          },
        })}
      >
        <Type look="body14" as="p" css={{ justifySelf: 'start' }}>
          Made in Australia <Emoji symbol="🇦🇺" alt="Australia" /> by{' '}
          <a
            href="https://www.thinkmill.com.au?utm_source=keystone-site"
            target="_blank"
            rel="noreferrer"
          >
            Thinkmill
          </a>
          , with contributions from around the world <Emoji symbol="🌏" alt="Globe" />
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
    </footer>
  )
}
