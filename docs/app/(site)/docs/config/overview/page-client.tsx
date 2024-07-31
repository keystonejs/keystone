/** @jsxImportSource @emotion/react */

'use client'

import { CommunitySlackCTA } from '../../../../../components/docs/CommunitySlackCTA'
import { Type } from '../../../../../components/primitives/Type'
import { Well } from '../../../../../components/primitives/Well'
import { useMediaQuery } from '../../../../../lib/media'

export default function Docs () {
  const mq = useMediaQuery()

  return (
    <>
      <Type as="h1" look="heading64">
        Configuration Overview
      </Type>

      <CommunitySlackCTA />

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Configuration
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad4" heading="System Configuration" href="/docs/config/config">
          Keystone's config function accepts an object representing all the configurable parts of
          your backend system.
        </Well>
        <Well grad="grad4" heading="Lists" href="/docs/config/lists">
          This is where you define the data model, or schema, of your Keystone system.
        </Well>
        <Well grad="grad4" heading="Fields" href="/docs/fields/overview">
          Defines the names, types, and configuration of the fields in a Keystone list.
        </Well>
        <Well grad="grad4" heading="Access Control" href="/docs/config/access-control">
          Configures who can read, create, update, and delete items in your Keystone system
        </Well>
        <Well grad="grad4" heading="Hooks" href="/docs/config/hooks">
          Let you execute code at different stages of the mutation lifecycle when performing create,
          update, and delete operations.
        </Well>
        <Well grad="grad4" heading="Session" href="/docs/config/session">
          Lets you configure session management in your Keystone system.
        </Well>
        <Well grad="grad4" heading="Authentication" href="/docs/config/auth">
          Supports authentication against a password field, creating initial items, password resets,
          and one-time authentication tokens.
        </Well>
      </div>
    </>
  )
}
