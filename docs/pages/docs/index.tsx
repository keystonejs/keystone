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

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        Example projects
      </Type>

      <Type as="p" look="body18" margin="0 0 1.5rem 0">
        A growing collection of projects you can run locally to learn more about Keystone features.
        Use these as a reference for best practice, and a jumping off point when adding features to
        your own Keystone project.{' '}
        <a
          href="https://github.com/keystonejs/keystone/tree/master/examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          View all &rarr;
        </a>
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad3"
          heading="Blog"
          href="https://github.com/keystonejs/keystone/blob/master/examples/blog"
          target="_blank"
          rel="noopener noreferrer"
        >
          A basic Blog schema with Posts and Authors. Use this as a starting place for learning how
          to use Keystone. It’s also a starter for other feature projects.
        </Well>
        <Well
          grad="grad3"
          heading="Task Manager"
          href="https://github.com/keystonejs/keystone/blob/master/examples/task-manager"
          target="_blank"
          rel="noopener noreferrer"
        >
          A basic Task Management app, with Tasks and People who can be assigned to tasks. Great for
          learning how to use Keystone. It’s also a starter for other feature projects.
        </Well>
        <Well
          grad="grad3"
          heading="Extend GraphQL Schema"
          href="https://github.com/keystonejs/keystone/blob/master/examples/extend-graphql-schema"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shows you how to extend the Keystone GraphQL API with custom queries and mutations. Builds
          upon the Blog starter project.
        </Well>
        <Well
          grad="grad3"
          heading="Default Values"
          href="https://github.com/keystonejs/keystone/blob/master/examples/default-values"
          target="_blank"
          rel="noopener noreferrer"
        >
          This project demonstrates how to use default values for fields. Builds upon the Task
          Manager starter project.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0">
        API references
      </Type>

      <Type as="h3" look="heading24" margin="2rem 0 1rem 0">
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

      <Type as="h3" look="heading24" margin="2rem 0 1rem 0">
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

      <Type as="h3" look="heading24" margin="2rem 0 1rem 0">
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
