/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Type } from '../../../components/primitives/Type';
import { DocsPage } from '../../../components/Page';
import { Well } from '../../../components/primitives/Well';
import { useMediaQuery } from '../../../lib/media';
import { InlineCode } from '../../../components/primitives/Code';

export function QuickStart() {
  const mq = useMediaQuery();
  return (
    <div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well heading="Keystone Quick Start" href="/docs/getting-started">
          Take a tour of Keystone in minutes with our CLI starter project
        </Well>
      </div>
    </div>
  );
}

export function Foundations() {
  const mq = useMediaQuery();
  return (
    <div>
      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
          margin: 'var(--space-xlarge) 0 0 0',
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
      </div>
    </div>
  );
}

export default function Docs() {
  return (
    <DocsPage
      noRightNav
      noProse
      title={'Walkthroughs'}
      description={
        'Explore tutorials with step-by-step instruction on building solutions with Keystone.'
      }
      isIndexPage
      editPath="docs/walkthroughs/index.tsx"
    >
      <Type as="h1" look="heading64">
        Walkthroughs
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Step-by-step tutorials for building with Keystone.
      </Type>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Getting started
      </Type>

      <Type as="p" look="body18" margin=".25rem 0 1.5rem 0">
        If you’re new to Keystone begin here. These walkthroughs introduce the system, key concepts,
        and show you how to get up and running with schema-driven development the Keystone way.
      </Type>

      <QuickStart />

      <Type as="h3" look="heading24" margin="2rem 0 1rem 0" id="learn-keystone">
        Learn Keystone
      </Type>

      <Type as="p" look="body18" margin=".25rem 0 1.5rem 0">
        Learn how to build a functioning blog backend with relationships, auth, and session data
        from an empty folder, and gain insights into Keystone’s core concepts along the way.
      </Type>

      <Foundations />
    </DocsPage>
  );
}
