/** @jsxImportSource @emotion/react */

'use client'

import { type ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '../Header'
import { Wrapper } from '../primitives/Wrapper'
import { Sidebar } from './Sidebar'
import { Stack } from '../primitives/Stack'
import { Breadcrumbs } from '../Breadcrumbs'
import { EditButton } from '../primitives/EditButton'
import { TableOfContents } from './TableOfContents'

import { useMediaQuery } from '../../lib/media'
import { DocsFooter } from '../Footer'
import { type HeadingType } from '../../markdoc/headings'

export function DocsLayoutClient ({
 children,
 headings = [],
 noProse,
 noRightNav,
 isIndexPage,
 editPath,
 docsNavigation
}: {
 children: ReactNode
 headings?: HeadingType[]
 noProse?: boolean
 noRightNav?: boolean
 isIndexPage?: boolean
 editPath?: string
 docsNavigation: ReactNode
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
          marginTop: '0rem',
          gridTemplateColumns: '15rem minmax(0, 1fr)',
          gridTemplateRows: '1fr auto',
          gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
        })}
      >
       <Sidebar docsNavigation={docsNavigation} />
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
           className={noProse ? '' : 'prose'}
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
       <DocsFooter />
     </Wrapper>
   </div>
 )
}