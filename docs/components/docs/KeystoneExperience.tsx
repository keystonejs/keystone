/** @jsxImportSource @emotion/react */

'use client'

import Link from 'next/link'

import { Bulb } from '../icons/Bulb'
import { Content } from '../icons/Content'
import { Code } from '../icons/Code'
import { Organization } from '../icons/Organization'
import { Video } from '../icons/Video'

import { useMediaQuery } from '../../lib/media'
import { Type } from '../primitives/Type'

export function KeystoneExperience () {
 const mq = useMediaQuery()
  return (
    <>
      <Type as="h2" look="heading30" margin="0 0 1rem 0">
        The Keystone Experience
      </Type>
      <div>
        <Type as="p" look="body18" css={{ maxWidth: '90ch', margin: '0 0 1.25rem' }}>
          Discover the vision behind Keystone and what it's like to work with. If you’ve just heard
          of Keystone, start here first:
        </Type>
        <div
          css={mq({
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr 1fr'],
            gap: ['1.5rem'],
            alignItems: 'stretch',
            '& > a': {
              borderRadius: '1rem',
              boxShadow: '0 0 5px var(--shadow)',
              padding: '1.5rem',
              color: 'var(--app-bg)',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
              textDecoration: 'none !important',
              '&:hover, &:focus': {
                boxShadow: '0 7px 21px var(--shadow)',
                transform: 'translateY(-4px)',
              },
              '& svg': {
                height: '2rem',
              },
            },
          })}
        >
          <a
            href="https://youtu.be/fPWRlmedCbo"
            css={{
              backgroundImage: `linear-gradient(116.01deg, var(--grad1-2), var(--grad1-1))`,
            }}
            target="_blank"
            rel="noreferrer"
          >
            <Video />
            <Type
              as="h2"
              look="heading20bold"
              css={{
                margin: '.5rem 0 .5rem 0 !important',
                color: 'inherit',
              }}
            >
              Video Intro →
            </Type>
            <Type
              as="p"
              look="body18"
              css={{
                color: 'inherit',
              }}
            >
              Learn how Keystone’s leading a new generation of content management tools.
            </Type>
          </a>
          <Link
            href="/why-keystone"
            css={{
              backgroundImage: `linear-gradient(116.01deg, var(--grad2-2), var(--grad2-1))`,
            }}
          >
            <Bulb />
            <Type
              as="h2"
              look="heading20bold"
              css={{
                margin: '.5rem 0 .5rem 0 !important',
                color: 'inherit',
              }}
            >
              Why Keystone →
            </Type>
            <Type
              as="p"
              look="body18"
              css={{
                color: 'inherit',
              }}
            >
              The makers. The vision. What’s in the box, and what you can build with it.
            </Type>
          </Link>
        </div>
      </div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr'],
          gap: ['1.5rem'],
          alignItems: 'stretch',
          margin: '1.5rem 0 2.5rem',
          '& > a': {
            borderRadius: '1rem',
            boxShadow: '0 0 5px var(--shadow)',
            padding: '1.5rem',
            color: 'var(--app-bg)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease, padding 0.2s ease',
            textDecoration: 'none !important',
            '&:hover, &:focus': {
              boxShadow: '0 7px 21px var(--shadow)',
              transform: 'translateY(-4px)',
            },
            '& svg': {
              height: '2rem',
            },
          },
        })}
      >
        <Link
          href="/for-developers"
          css={{
            backgroundImage: `linear-gradient(116.01deg, var(--grad3-2), var(--grad3-1))`,
          }}
        >
          <Code />
          <Type
            as="h2"
            look="heading20bold"
            css={{
              margin: '.5rem 0 .5rem 0 !important',
              color: 'inherit',
            }}
          >
            For Developers →
          </Type>
          <Type
            as="p"
            look="body18"
            css={{
              color: 'inherit',
            }}
          >
            Built the way you’d want it made. Keystone fits with the tools you know and love.
          </Type>
        </Link>
        <Link
          href="/for-content-management"
          css={{
            backgroundImage: `linear-gradient(116.01deg, var(--grad5-2), var(--grad5-1))`,
          }}
        >
          <Content />
          <Type
            as="h2"
            look="heading20bold"
            css={{
              margin: '.5rem 0 .5rem 0 !important',
              color: 'inherit',
            }}
          >
            For Editors →
          </Type>
          <Type
            as="p"
            look="body18"
            css={{
              color: 'inherit',
            }}
          >
            The configurable editing environment you need to do your best work.
          </Type>
        </Link>
        <Link
          href="/for-organisations"
          css={{
            backgroundImage: `linear-gradient(116.01deg, var(--grad4-2), var(--grad4-1))`,
          }}
        >
          <Organization />
          <Type
            as="h2"
            look="heading20bold"
            css={{
              margin: '.5rem 0 .5rem 0 !important',
              color: 'inherit',
            }}
          >
            For Organisations →
          </Type>
          <Type
            as="p"
            look="body18"
            css={{
              color: 'inherit',
            }}
          >
            Own your data. Start fast. Find your audience anywhere. Scale on your terms.
          </Type>
        </Link>
      </div>
    </>
  )
}
