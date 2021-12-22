/** @jsxRuntime classic */
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
        heading="Keystone 6 Quick Start"
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
        Git. You end up with a queryable GraphQL endpoint running live on Vercel.
      </Well>
      <Well heading="Learning Keystone Lesson 1" href="/docs/walkthroughs/lesson-1">
        Set up Keystone from scratch, and learn about the minimum configuration you need to run
        Keystone. At the end you'll have a small keystone project with a `User` list.
      </Well>
      <Well heading="Learning Keystone Lesson 2" href="/docs/walkthroughs/lesson-2">
        Expand on what we looked through in lesson 1, by adding a more complex list with some new
        fields. We will explore adding a `Post` list and using relationships in keystone
      </Well>
    </div>
  );
}
