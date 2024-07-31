/** @jsxImportSource @emotion/react */

'use client'

import { useRef, Fragment, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { useMediaQuery } from '../lib/media'
import { TableOfContents } from './docs/TableOfContents'
import { Wrapper } from './primitives/Wrapper'
import { EditButton } from './primitives/EditButton'
import { Breadcrumbs } from './Breadcrumbs'
import { Stack } from './primitives/Stack'
import { Header } from './Header'
import { Footer } from './Footer'
import { type HeadingType } from './Markdoc'

export function BlogPage ({
  children,
  headings = [],
  noRightNav,
  isIndexPage,
  editPath,
}: {
  children: ReactNode
  headings?: HeadingType[]
  noRightNav?: boolean
  isIndexPage?: boolean
  editPath?: string
}) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const mq = useMediaQuery()
  const pathname = usePathname()

  return (
    <div
      css={{
        gridArea: 'main',
        position: 'relative',
        display: 'grid',
        gridTemplateRows: '4.5rem calc(100vh - 4.5rem)',
      }}
    >
      <Header />
      <Wrapper
        css={mq({
          borderTop: '1px solid var(--border)',
          overflowY: 'auto',
          display: ['block', null, 'grid'],
          margin: '0 auto 0',
          paddingLeft: ['var(--space-xlarge)', 'var(--space-xlarge)', null, '7.5rem'],
          paddingRight: ['var(--space-xlarge)', 'var(--space-xlarge)', null, '7.5rem'],
          gridTemplateRows: '1fr auto',
          gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
        })}
      >
        <div
          id="content-and-toc"
          css={mq({
            gridColumn: '2 / 3',
            gridRow: '1 / 2',
            display: ['block', null, 'grid'],
            gridTemplateColumns: noRightNav
              ? 'minmax(0, 1fr)'
              : ['minmax(0, 1fr)', null, null, 'minmax(0, 1fr) 10rem', 'minmax(0, 1fr) 15rem'],
            gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
          })}
        >
          <main
            id="skip-link-content"
            tabIndex={0}
            ref={contentRef}
            className={'prose'}
            css={{
              paddingTop: '2rem',
            }}
          >
            <Stack
              orientation="horizontal"
              block
              css={{ justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <Breadcrumbs />

              <EditButton pathName={pathname || ''} isIndexPage={isIndexPage} editPath={editPath} />
            </Stack>
            <div id="content" css={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
              {children}
            </div>
          </main>
          {!!headings.length && !noRightNav && (
            <TableOfContents container={contentRef} headings={headings} />
          )}
        </div>
        <Footer />
      </Wrapper>
    </div>
  )
}

export function Page ({ children }: { children: ReactNode }) {
  return (
    <Fragment>
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Header />
        <Wrapper as="main" id="skip-link-content" tabIndex={0}>
          {children}
        </Wrapper>
      </div>
      <Footer />
    </Fragment>
  )
}
