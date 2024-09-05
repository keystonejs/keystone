/** @jsxImportSource @emotion/react */

'use client'

import Link from 'next/link'

import { MWrapper } from '../../../components/content/MWrapper'
import { Page } from '../../../components/Page'
import { Type } from '../../../components/primitives/Type'
import { Highlight } from '../../../components/primitives/Highlight'
import { useMediaQuery } from '../../../lib/media'

export default function Docs ({ posts }) {
  const mq = useMediaQuery()

  return (
    <Page>
      <MWrapper css={{ marginTop: 0 }}>
        <section
          css={mq({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            paddingTop: ['3rem', '5rem'],
            paddingBottom: ['3rem', '5rem'],
            borderBottom: '1px solid var(--border)',
          })}
        >
          <Type
            as="h1"
            look="heading92"
            fontSize={['2.85rem', '4rem', null, '4.5rem']}
            margin={['0 0 1rem 0']}
            css={{
              maxWidth: '64rem',
              textAlign: 'center',
            }}
          >
            <Highlight look="grad1">Keystone Blog</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            color="var(--muted)"
            css={{
              maxWidth: '49rem',
              textAlign: 'center',
            }}
          >
            Latest news and announcements from the Keystone team.
          </Type>
        </section>
        <section>
          <ul
            css={{
              listStyle: 'none',
              padding: 0,
              marginBottom: 0,
            }}
          >
            {posts.map((post) => {
              return (
                <li
                  css={mq({
                    paddingTop: ['1rem', '2rem'],
                    paddingBottom: ['2rem', '3rem'],
                    ':last-child': {
                      paddingBottom: 0,
                    },
                    borderTop: '1px solid var(--border)',
                    ':first-child': {
                      paddingTop: 0,
                      borderTopWidth: 0,
                    },
                    display: [null, 'grid'],
                    gap: '0.5rem',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                  })}
                  key={post.slug}
                >
                  <Type
                    as="div"
                    look="body18"
                    color="var(--muted)"
                    css={{
                      paddingTop: '1rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}
                  >
                    {post.formattedDateStr}
                  </Type>
                  <div
                    css={{
                      gridColumn: 'span 2 / span 2',
                      paddingTop: '1rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      passHref
                      css={{
                        textDecoration: 'none',
                        color: 'var(--text-heading)',
                        ':hover': {
                          color: 'var(--link)',
                        },
                      }}
                    >
                      <Type as="h2" look="heading24" css={{ color: 'inherit' }}>
                        {post.frontmatter.title}
                      </Type>
                    </Link>
                    <Type as="p" look="body18" color="var(--muted)" css={{ paddingTop: '1rem' }}>
                      {post.frontmatter.description}
                    </Type>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </MWrapper>
    </Page>
  )
}
