/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Button } from '../../components/primitives/Button';
import { Alert } from '../../components/primitives/Alert';
import { Type } from '../../components/primitives/Type';
import { Well } from '../../components/primitives/Well';
import { ArrowR } from '../../components/icons/ArrowR';
import { DocsPage } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage noRightNav noProse>
      <Type as="h1" look="heading64" css={{ lineHeight: 1 }}>
        Keystone Docs
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 0 0">
        More than a backend framework. More than a Headless CMS. Keystone is a platform for next-gen
        development workflows and evolution.
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
        <Button as="a" href="/docs">
          Get Started <ArrowR />
        </Button>
      </Alert>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Tutorials
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Step-by-step instructions for getting things done with Keystone.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          heading="Getting started with Keystone 6"
          href="/docs/tutorials/getting-started-with-create-keystone-app"
        >
          Learn how to use our CLI to get Keystone’s Admin UI and GraphQL API running in a new local
          project folder.
        </Well>
        <Well
          heading="How to embed Keystone + SQLite in a Next.js app"
          href="/docs/tutorials/embedded-mode-with-sqlite-nextjs"
        >
          Learn how to run Keystone in the same folder as your frontend code and commit everything
          to Git. You end up with a queryable GraphQL endpoint running live on Vercel for free.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Guides
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        Practical explanations of Keystone’s fundamental building blocks. When you’re trying to get
        something done, Keystone guides show you how to think about, and get the most out of each
        feature.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad2"
          heading="Keystone 5 vs Next. Which should you use?"
          href="/docs/guides/keystone-5-vs-keystone-next"
        >
          We’re transitioning to Keystone 6 soon. If you’re wondering which version to start a new
          project with today, this guide is for you.
        </Well>
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
          Keystone’s document field is a highly customizable rich text editor that stores content as
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
