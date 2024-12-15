/** @jsxImportSource @emotion/react */

import { useMediaQuery } from '../../lib/media'
import { DocsNavigation } from './Navigation'

type SidebarProps = {
  docsNavigation?: React.ReactNode
}

export function Sidebar ({ docsNavigation }: SidebarProps) {
  const mq = useMediaQuery()

  return (
    <aside
      css={mq({
        borderRight: '1px solid var(--border)',
        display: ['none', null, 'block'],
        fontSize: 'var(--font-xsmall)',
        gridColumn: '1 / 2',
        gridRow: '1 / 3',
        position: 'sticky',
        top: '0',
        overflow: 'auto',
        height: 'calc(100vh - 4.5rem)',
      })}
    >
      <div
        id="skip-link-navigation"
        tabIndex={0}
        css={mq({
          padding: ['2rem 0 var(--space-large) var(--space-large)', null, 0],
          borderBottom: ['1px solid var(--muted)', null, 'none'],
          alignSelf: 'start',
        })}
      >
        <div
          css={{
            paddingTop: '2rem',
            paddingBottom: '2rem',
          }}
        >
          <DocsNavigation docsNavigation={docsNavigation} />
        </div>
      </div>
    </aside>
  )
}
