import Link from 'next/link'
import React from 'react'
import { PageContainer } from '@keystone-6/core/admin-ui/components'
import { Heading } from '@keystar/ui/typography'

// Please note that while this capability is driven by Next.js's pages directory
// We do not currently support any of the auxillary methods that Next.js provides i.e. `getStaticProps`
// Presently the only export from the directory that is supported is the page component itself.
export default function CustomPage () {
  return (
    <PageContainer header={<Heading type="h3">Custom Page</Heading>}>
      <h1
        style={{
          width: '100%',
          textAlign: 'center',
        }}
      >
        This is a custom Admin UI Page
      </h1>
      <p
        style={{
          textAlign: 'center',
        }}
      >
        It can be accessed via the route <Link href="/custom-page">/custom-page</Link>
      </p>
    </PageContainer>
  )
}
