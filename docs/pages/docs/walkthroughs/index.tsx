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
        Walkthroughs
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Step-by-step instructions for getting things done with Keystone.
      </Type>

      <Alert css={{ margin: '2rem 0' }}>
        <span
          css={{
            display: 'inline-block',
            margin: '0 1rem 0.5rem 0',
          }}
        >
          Need answers to Keystone questions? Get help in our
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

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          heading="Getting started with Keystone 6"
          href="/docs/walkthroughs/getting-started-with-create-keystone-app"
        >
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well
          heading="How to embed Keystone + SQLite in a Next.js app"
          href="/docs/walkthroughs/embedded-mode-with-sqlite-nextjs"
        >
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
      </div>
    </DocsPage>
  );
}
