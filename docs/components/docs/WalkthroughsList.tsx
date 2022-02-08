/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Well } from '../primitives/Well';
import { useMediaQuery } from '../../lib/media';
import { InlineCode } from '../../components/primitives/Code';

export function Walkthroughs() {
  const mq = useMediaQuery();
  return (
    <div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr'],
          gap: 'var(--space-xlarge)',
          margin: '0 0 var(--space-xlarge) 0',
        })}
      >
        <Well
          heading="Keystone Quick Start"
          href="/docs/walkthroughs/getting-started-with-create-keystone-app"
        >
          Take a tour of Keystone in minutes with our CLI starter project
        </Well>
      </div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad2"
          heading="Lesson 1: Installing Keystone "
          href="/docs/walkthroughs/lesson-1"
        >
          Get Keystone up and running with your first content type
        </Well>
        <Well grad="grad2" heading="Lesson 2: Relating things" href="/docs/walkthroughs/lesson-2">
          Connect two content types and learn how to configure the appearance of field inputs
        </Well>
        <Well
          grad="grad2"
          heading="Lesson 3: Publishing workflows"
          href="/docs/walkthroughs/lesson-3"
        >
          Support publishing needs with Keystone's <InlineCode>select</InlineCode> and{' '}
          <InlineCode>timestamp</InlineCode> fields
        </Well>
        <Well grad="grad2" heading="Lesson 4: Auth & Sessions" href="/docs/walkthroughs/lesson-4">
          Add sessions, password protection, and a sign-in screen to your Keystone app
        </Well>
        <Well grad="grad2" heading="Lesson 5: Rich Text" href="/docs/walkthroughs/lesson-5">
          Add a powerful <InlineCode>document</InlineCode> field to your app and learn how to
          configure it to meet your needs
        </Well>
        <Well
          grad="grad2"
          heading="How to embed Keystone + SQLite in a Next.js app"
          href="/docs/walkthroughs/embedded-mode-with-sqlite-nextjs"
        >
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel.
        </Well>
      </div>
    </div>
  );
}
