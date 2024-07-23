/** @jsxImportSource @emotion/react */

'use client'

import { usePathname } from 'next/navigation'

import { Highlight } from '../../components/primitives/Highlight'
import { Type } from '../../components/primitives/Type'
import { Page } from '../../components/Page'

function ConstructionIllustration () {
  return (
    <div
      css={{
        background: '#fff',
        width: '100%',
        maxWidth: '30rem',
        margin: '2rem auto 0',
        padding: '2rem',
        borderRadius: '2rem',
      }}
    >
      <img
        src="/assets/404.svg"
        alt="The Keystone logo under construction"
        css={{
          width: '100%',
        }}
      />
    </div>
  )
}

// modifying this code may have security implications
//   see https://github.com/keystonejs/keystone/pull/6411#issuecomment-906085389
const v5PathList = ['/tutorials', '/guides', '/keystonejs', '/api', '/discussions']

export const metadata = {
  title: 'Page Not Found (404)',
  description: 'The page you are looking for could not be found.',
}

export default function NotFoundPage () {
  const pathname = usePathname()
  const tryV5Link = v5PathList.some((x) => pathname.startsWith(x))
  return (
    <Page>
      <div
        css={{
          display: 'grid',
          justifyItems: 'center',
          margin: '2rem 0',
          textAlign: 'center',
        }}
      >
        <Type as="h1" look="heading48" fontSize={['8vw', null, null, '5rem']}>
          <Highlight look="grad4">404</Highlight> <Type color="var(--muted)">Page Not Found</Type>
        </Type>
        <Type as="p" look="body18bold" margin="2rem 0 0">
          We're sorry but we couldn't find what you're looking for.
        </Type>
        {tryV5Link ? (
          <Type as="p" look="body18bold" margin="2rem 0 0">
            If you were looking for a page in the Keystone 5 docs, try{' '}
            <a href={'https://v5.keystonejs.com' + pathname}>https://v5.keystonejs.com{pathname}</a>
            .
          </Type>
        ) : null}
        <ConstructionIllustration />
      </div>
    </Page>
  )
}
