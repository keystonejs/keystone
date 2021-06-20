/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Button } from '../../../components/primitives/Button';
import { Alert } from '../../../components/primitives/Alert';
import { Type } from '../../../components/primitives/Type';
import { Well } from '../../../components/primitives/Well';
import { ArrowR } from '../../../components/icons/ArrowR';
import { DocsPage } from '../../../components/Page';
import { useMediaQuery } from '../../../lib/media';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage noRightNav noProse>
      <Type as="h1" look="heading64">
        API Reference
      </Type>

      <Alert css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 1rem 0.5rem 0',
          }}
        >
          Need answers to Keystone questions? Get the help you need in the
        </span>
        <Button
          as="a"
          href="https://community.keystonejs.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Community Slack <ArrowR />
        </Button>
      </Alert>

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
        <Well grad="grad4" heading="System Configuration API" href="/docs/apis/config">
          Keystone’s config function accepts an object representing all the configurable parts of
          your backend system.
        </Well>
        <Well grad="grad4" heading="Schema API" href="/docs/apis/schema">
          This is where you define the data model, or schema, of your Keystone system.
        </Well>
        <Well grad="grad4" heading="Fields API" href="/docs/apis/fields">
          Defines the names, types, and configuration of the fields in a Keystone list.
        </Well>
        <Well grad="grad4" heading="Access Control" href="/docs/apis/access-control">
          Configures who can read, create, update, and delete items in your Keystone system
        </Well>
        <Well grad="grad4" heading="Hooks" href="/docs/apis/hooks">
          Let you execute code at different stages of the mutation lifecycle when performing create,
          update, and delete operations.
        </Well>
        <Well grad="grad4" heading="Session" href="/docs/apis/session">
          Lets you configure session management in your Keystone system.
        </Well>
        <Well grad="grad4" heading="Authentication" href="/docs/apis/auth">
          Supports authentication against a password field, creating initial items, password resets,
          and one-time authentication tokens.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Context
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad4" heading="Context API" href="/docs/apis/context">
          The primary API entry point for all of the run-time functionally of your Keystone system.
        </Well>
        <Well grad="grad4" heading="List Items API" href="/docs/apis/list-items">
          A programmatic API for running CRUD operations against your GraphQL API.
        </Well>
        <Well grad="grad4" heading="Database Items API" href="/docs/apis/db-items">
          A programmatic API for running CRUD operations against the internal GraphQL resolvers in
          your system.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        GraphQL
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad4" heading="GraphQL API" href="/docs/apis/graphql">
          Generates a CRUD (create, read, update, delete) GraphQL API based on the schema definition
          provided in your system configuration.
        </Well>
        <Well grad="grad4" heading="Query filter API" href="/docs/apis/filters">
          A list of the filters you can query against for each field type.
        </Well>
      </div>
    </DocsPage>
  );
}
