/** @jsxImportSource @emotion/react */

'use client'

import { CommunitySlackCTA } from '../../../components/docs/CommunitySlackCTA.tsx'
import { Keystone5DocsCTA } from '../../../components/docs/Keystone5DocsCTA.tsx'
import { Type } from '../../../components/primitives/Type.tsx'
import { CommunityCta } from '../../../components/content/CommunityCta.tsx'
import { Alert } from '../../../components/primitives/Alert.tsx'
import { Button } from '../../../components/primitives/Button.tsx'
import { ArrowR } from '../../../components/icons/index.ts'
import { KeystoneExperience } from '../../../components/docs/KeystoneExperience.tsx'

export default function DocsPageClient({ featuredExamples, featuredDocs }) {
  return (
    <>
      <Type as="h1" look="heading64">
        Developer Docs
      </Type>

      <Keystone5DocsCTA />
      <CommunitySlackCTA />
      <Alert look="neutral" css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 1rem 0.5rem 0',
          }}
        >
          Looking for enterprise-grade consulting & support?
        </span>
        <Button as="a" href="/enterprise" look="secondary">
          Learn more <ArrowR />
        </Button>
      </Alert>
      <KeystoneExperience />
      {featuredDocs}
      {featuredExamples}
      <CommunityCta />
    </>
  )
}
