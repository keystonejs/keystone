/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Well } from '../primitives/Well';
import { useMediaQuery } from '../../lib/media';

export function Walkthroughs() {
  const mq = useMediaQuery();
  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
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
        Learn how to run Keystone in the same folder as your frontend code and commit everything to
        Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
      </Well>
    </div>
  );
}
