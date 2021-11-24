/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import Link from 'next/link';
import { GitHubExamplesCTA } from '../../components/docs/GitHubExamplesCTA';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';
import { Well } from '../../components/primitives/Well';
import { useMediaQuery } from '../../lib/media';
import { InlineCode } from '../../components/primitives/Code';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <DocsPage
      noRightNav
      noProse
      title={'Examples'}
      description={
        'A growing collection of projects you can run locally to learn more about Keystone’s many features. Use them as a reference for best practice, and springboard when adding features to your own project.'
      }
      editPath={'docs/examples.tsx'}
    >
      <Type as="h1" look="heading64">
        Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        A growing collection of projects you can run locally to learn more about Keystone’s
        capabilities. Each example includes documentation explaining the how and why. Use them as a
        reference for best practice, and a jumping off point when adding features to your own
        Keystone project.
      </Type>

      <GitHubExamplesCTA />

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="base-projects">
        Base Projects
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Simple starters to get you up and running with a local Keystone instance and understand the
        basics of designing a{' '}
        <Link href="/docs/apis/schema" passHref>
          <a>schema</a>
        </Link>{' '}
        .
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad1"
          heading="Blog"
          href="https://github.com/keystonejs/keystone/blob/main/examples/blog"
          target="_blank"
          rel="noopener noreferrer"
        >
          A basic Blog schema with Posts and Authors. Use this as a starting place for learning how
          to use Keystone. It’s also a starter for other feature projects.
        </Well>
        <Well
          grad="grad1"
          heading="Task Manager"
          href="https://github.com/keystonejs/keystone/blob/main/examples/task-manager"
          target="_blank"
          rel="noopener noreferrer"
        >
          A basic Task Management app, with Tasks and People who can be assigned to tasks. Great for
          learning how to use Keystone. It’s also a starter for other feature projects.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="feature-projects">
        Feature Projects
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Derived from the Base Projects, these examples demonstrate a particular feature of Keystone,
        and show you best practice for implementing it.
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad2"
          heading="Authentication"
          href="https://github.com/keystonejs/keystone/tree/main/examples/with-auth"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds password-based authentication to the Task Manager starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Custom Admin UI Logo"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds a custom logo component in the Admin UI. Builds on the Task Manager starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Custom Admin UI Navigation"
          href="/docs/guides/custom-admin-ui-navigation"
        >
          Adds a custom Navigation component to the Admin UI. Builds on the Task Manager starter
          project.
        </Well>
        <Well
          grad="grad2"
          heading="Custom Admin UI Pages"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-pages"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds a custom page in the Admin UI. Builds on the Task Manager starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Custom Field Type"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds a custom field type based on the <InlineCode>integer</InlineCode> field type which
          lets users rate items on a 5-star scale. Builds on the Blog starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Custom Field View"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field-view"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adds a custom Admin UI view to a <InlineCode>json</InlineCode> field which provides a
          customised editing experience for users. Builds on the Task Manager starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Default Values"
          href="https://github.com/keystonejs/keystone/blob/main/examples/default-values"
          target="_blank"
          rel="noopener noreferrer"
        >
          Demonstrates how to use default values for fields. Builds upon the Task Manager starter
          project.
        </Well>
        <Well
          grad="grad2"
          heading="Document field"
          href="https://github.com/keystonejs/keystone/tree/main/examples/document-field"
          target="_blank"
          rel="noopener noreferrer"
        >
          Illustrates how to configure <InlineCode>document</InlineCode> fields in your Keystone
          system and render their data in a frontend application. Builds on the Blog starter
          project.
        </Well>
        <Well
          grad="grad2"
          heading="Extend GraphQL Schema"
          href="https://github.com/keystonejs/keystone/blob/main/examples/extend-graphql-schema"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shows you how to extend the Keystone GraphQL API with custom queries and mutations. Builds
          upon the Blog starter project.
        </Well>
        <Well
          grad="grad2"
          heading="Extend GraphQL Schema with GraphQL TS"
          href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema-graphql-ts"
          target="_blank"
          rel="noopener noreferrer"
        >
          Demonstrates how to extend the GraphQL API provided by Keystone with custom queries and
          mutations using graphql-ts.
        </Well>
        <Well
          grad="grad2"
          heading="Extend GraphQL API with Nexus"
          href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema-nexus"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shows you how to use <strong>Nexus</strong> to extend the GraphQL API provided by Keystone
          with custom queries and mutations.
        </Well>

        <Well
          grad="grad2"
          heading="JSON Field"
          href="https://github.com/keystonejs/keystone/tree/main/examples/json"
          target="_blank"
          rel="noopener noreferrer"
        >
          Illustrates how to use the <InlineCode>json</InlineCode> field type. Builds on the Task
          Manager starter project.
        </Well>

        <Well
          grad="grad2"
          heading="REST API endpoint"
          href="https://github.com/keystonejs/keystone/tree/main/examples/rest-api"
        >
          Demonstrates how to create REST endpoints by extending Keystone's express app and using
          the Query API to execute queries against the schema.
        </Well>
        <Well
          grad="grad2"
          heading="Testing"
          href="https://github.com/keystonejs/keystone/tree/main/examples/testing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shows you how to write tests against the GraphQL API to your Keystone system. Builds on
          the Authentication example project.
        </Well>
        <Well
          grad="grad2"
          heading="Virtual fields"
          href="https://github.com/keystonejs/keystone/tree/main/examples/virtual-field"
          target="_blank"
          rel="noopener noreferrer"
        >
          Implements virtual fields in a Keystone list. Builds on the Blog starter project.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="deployment-projects">
        Deployment Projects
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Examples with all the code and documentation you need to get a Keystone project hosted on
        the web. You can find them in the{' '}
        <Link href="https://github.com/keystonejs/" passHref>
          <a>Keystone Github Organisation</a>
        </Link>
        .
      </Type>

      <div
        css={mq({
          display: 'grid',
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
          gap: 'var(--space-xlarge)',
        })}
      >
        <Well
          grad="grad4"
          heading="Heroku"
          href="https://github.com/keystonejs/keystone-6-heroku-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Based on the <InlineCode>with-auth</InlineCode> project, this example deploys a simple app
          backend to Heroku. Includes a <strong>one-click deployment</strong> for Heroku account
          holders.
        </Well>
        <Well
          grad="grad4"
          heading="Microsoft Azure"
          badge="Third Party"
          href="https://github.com/aaronpowell/keystone-6-azure-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Deploys a Keystone app backend to Microsoft Azure. Based on the{' '}
          <InlineCode>with-auth</InlineCode> project. <strong>One-click deployment</strong>{' '}
          included.
        </Well>
        <Well
          grad="grad4"
          heading="Railway"
          href="https://github.com/keystonejs/keystone-6-railway-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Deploys a Keystone app backend to Railway. Based on the <InlineCode>with-auth</InlineCode>{' '}
          project. <strong>One-click deployment</strong> included.
        </Well>
      </div>
    </DocsPage>
  );
}
