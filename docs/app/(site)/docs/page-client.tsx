/** @jsxImportSource @emotion/react */

'use client'

import { CommunitySlackCTA } from '../../../components/docs/CommunitySlackCTA'
import { Keystone5DocsCTA } from '../../../components/docs/Keystone5DocsCTA'
import { Type } from '../../../components/primitives/Type'
import { CommunityCta } from '../../../components/content/CommunityCta'
import { Alert } from '../../../components/primitives/Alert'
import { Button } from '../../../components/primitives/Button'
import { ArrowR } from '../../../components/icons'
import { KeystoneExperience } from '../../../components/docs/KeystoneExperience'

export default function DocsPageClient ({ featuredExamples, featuredDocs }) {
  
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
