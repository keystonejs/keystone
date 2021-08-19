/** @jsx jsx */
import { jsx } from '@emotion/react';

import { CommunitySlackCTA } from '../../../components/docs/CommunitySlackCTA';
import { Type } from '../../../components/primitives/Type';
import { Well } from '../../../components/primitives/Well';
import { DocsPage } from '../../../components/Page';
import { useMediaQuery } from '../../../lib/media';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Guides'}
      description={
        'Practical explanations of Keystone’s fundamental building blocks. Learn how to think about, and get the most out of Keystone’s many features.'
      }
    >
      <Type as="h1" look="heading64">
        Keystone Guides
      </Type>
      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Practical explanations of Keystone’s fundamental building blocks. When you’re trying to get
        something done, Keystone guides show you how to think about, and get the most out of each
        feature.
      </Type>
      <CommunitySlackCTA />
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well grad="grad2" heading="Command line foundations" href="/docs/guides/cli">
          Keystone’s CLI helps you develop, build, and deploy projects. This guide explains all you
          need to standup a new backend in the terminal.
        </Well>
        <Well grad="grad2" heading="Understanding Relationships" href="/docs/guides/relationships">
          Learn how to reason about and configure relationships in Keystone, so you can bring value
          to your project through structured content.
        </Well>
        <Well grad="grad2" heading="GraphQL Queries - Filters" href="/docs/guides/filters">
          Query filters are an integral part of Keystone’s powerful GraphQL APIs. This guide will
          show you how to use filters to get the data you need from your system.
        </Well>
        <Well grad="grad2" heading="How To Use Document Fields" href="/docs/guides/document-fields">
          Keystone’s document field is a highly customisable rich text editor that stores content as
          structured JSON. Learn how to configure it and incorporate your own custom React
          components.
        </Well>
        <Well grad="grad2" heading="Understanding Hooks" href="/docs/guides/hooks">
          Learn how to use Hooks within your schema to extend Keystone’s powerful CRUD GraphQL APIs
          with your own business logic.
        </Well>
      </div>
    </DocsPage>
  );
}
