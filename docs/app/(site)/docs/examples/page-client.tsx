/** @jsxImportSource @emotion/react */

'use client'

import { GitHubExamplesCTA } from '../../../../components/docs/GitHubExamplesCTA'
import { Type } from '../../../../components/primitives/Type'
import { DocsPage } from '../../../../components/Page'
import { Well } from '../../../../components/primitives/Well'
import { useMediaQuery } from '../../../../lib/media'
import { InlineCode } from '../../../../components/primitives/Code'

export default function Docs () {
  const mq = useMediaQuery()

  return (
    <DocsPage
      noRightNav
      noProse
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

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="standalone-examples">
        Standalone Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Standalone examples demonstrate how a particular feature works or how to solve a problem
        with Keystone.
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
          href="https://github.com/keystonejs/keystone/blob/main/examples/usecase-blog"
          target="_blank"
          rel="noreferrer"
        >
          A basic Blog schema with Posts and Authors. Use this as a starting place for learning how
          to use Keystone.
        </Well>
        <Well
          grad="grad1"
          heading="Task Manager"
          href="https://github.com/keystonejs/keystone/blob/main/examples/usecase-todo"
          target="_blank"
          rel="noreferrer"
        >
          A basic Task Management app, with Tasks and People who can be assigned to tasks. Great for
          learning how to use Keystone.
        </Well>

        <Well
          grad="grad1"
          heading="Authentication"
          href="https://github.com/keystonejs/keystone/tree/main/examples/auth"
          target="_blank"
          rel="noreferrer"
        >
          Adds password-based authentication to the Task Manager starter project.
        </Well>
        <Well
          grad="grad1"
          heading="Custom Admin UI Logo"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-logo"
          target="_blank"
          rel="noreferrer"
        >
          Adds a custom logo component in the Admin UI.
        </Well>
        <Well
          grad="grad1"
          heading="Custom Admin UI Navigation"
          href="/docs/guides/custom-admin-ui-navigation"
        >
          Adds a custom Navigation component to the Admin UI.
        </Well>
        <Well
          grad="grad1"
          heading="Custom Admin UI Pages"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-pages"
          target="_blank"
          rel="noreferrer"
        >
          Adds a custom page in the Admin UI.
        </Well>
        <Well
          grad="grad1"
          heading="Custom Field Type"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field"
          target="_blank"
          rel="noreferrer"
        >
          Adds a custom field type based on the <InlineCode>integer</InlineCode> field type which
          lets users rate items on a 5-star scale.
        </Well>
        <Well
          grad="grad1"
          heading="Custom Field View"
          href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field-view"
          target="_blank"
          rel="noreferrer"
        >
          Adds a custom Admin UI view to a <InlineCode>json</InlineCode> field which provides a
          customised editing experience for users.
        </Well>
        <Well
          grad="grad1"
          heading="Default Values"
          href="https://github.com/keystonejs/keystone/blob/main/examples/default-values"
          target="_blank"
          rel="noreferrer"
        >
          Demonstrates how to use default values for fields.
        </Well>
        <Well
          grad="grad1"
          heading="Document field"
          href="https://github.com/keystonejs/keystone/tree/main/examples/document-field"
          target="_blank"
          rel="noreferrer"
        >
          Illustrates how to configure <InlineCode>document</InlineCode> fields in your Keystone
          system and render their data in a frontend application.
        </Well>
        <Well
          grad="grad1"
          heading="Extend GraphQL Schema"
          href="https://github.com/keystonejs/keystone/blob/main/examples/extend-graphql-schema"
          target="_blank"
          rel="noreferrer"
        >
          Shows you how to extend the Keystone GraphQL API with custom queries and mutations.
        </Well>
        <Well
          grad="grad1"
          heading="Extend GraphQL Schema with GraphQL TS"
          href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema-graphql-ts"
          target="_blank"
          rel="noreferrer"
        >
          Demonstrates how to extend the GraphQL API provided by Keystone with custom queries and
          mutations using graphql-ts.
        </Well>
        <Well
          grad="grad1"
          heading="Extend GraphQL API with Nexus"
          href="https://github.com/keystonejs/keystone/tree/main/examples/extend-graphql-schema-nexus"
          target="_blank"
          rel="noreferrer"
        >
          Shows you how to use <strong>Nexus</strong> to extend the GraphQL API provided by Keystone
          with custom queries and mutations.
        </Well>

        <Well
          grad="grad1"
          heading="JSON Field"
          href="https://github.com/keystonejs/keystone/tree/main/examples/json"
          target="_blank"
          rel="noreferrer"
        >
          Illustrates how to use the <InlineCode>json</InlineCode> field type. Builds on the Task
          Manager starter project.
        </Well>

        <Well
          grad="grad1"
          heading="REST API endpoint"
          href="https://github.com/keystonejs/keystone/tree/main/examples/extend-express-app"
        >
          Demonstrates how to create REST endpoints by extending Keystone's express app and using
          the Query API to execute queries against the schema.
        </Well>
        <Well
          grad="grad1"
          heading="Testing"
          href="https://github.com/keystonejs/keystone/tree/main/examples/testing"
          target="_blank"
          rel="noreferrer"
        >
          Shows you how to write tests against the GraphQL API to your Keystone system.
        </Well>
        <Well
          grad="grad1"
          heading="Virtual fields"
          href="https://github.com/keystonejs/keystone/tree/main/examples/virtual-field"
          target="_blank"
          rel="noreferrer"
        >
          Implements virtual fields in a Keystone list.
        </Well>
        <Well
          grad="grad1"
          heading="Singleton"
          href="https://github.com/keystonejs/keystone/tree/main/examples/singleton"
          target="_blank"
          rel="noreferrer"
        >
          Demonstrates how to use singleton lists with Keystone.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="end-to-end-examples">
        End-to-End Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        End to end examples demonstrate how a feature works or how to solve a problem with an
        independent frontend application and a Keystone server.
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
          heading="Document Field Customisation"
          href="https://github.com/keystonejs/keystone/blob/main/examples/usecase-blog"
          target="_blank"
          rel="noreferrer"
        >
          Example to demonstrate customisation of Keystone's document field and document renderer.
        </Well>

        <Well
          grad="grad2"
          heading="Next.js + Keystone"
          href="https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-app-directory"
          target="_blank"
          rel="noreferrer"
        >
          Shows you how to use Keystone as a data engine within Next.js applications.
        </Well>
      </div>

      <Type as="h2" look="heading30" margin="2rem 0 1rem 0" id="deployment-examples">
        Deployment Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Examples with all the code and documentation you need to get a Keystone project hosted on
        the web. You can find them in the{' '}
        <a href="https://github.com/keystonejs/">Keystone Github Organisation</a>.
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
          rel="noreferrer"
        >
          Based on the <InlineCode>with-auth</InlineCode> project, this example deploys a simple app
          backend to Heroku. Includes a <strong>one-click deployment</strong> for Heroku account
          holders.
        </Well>
        <Well
          grad="grad4"
          heading="Microsoft Azure"
          badge="Community"
          href="https://github.com/aaronpowell/keystone-6-azure-example"
          target="_blank"
          rel="noreferrer"
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
          rel="noreferrer"
        >
          Deploys a Keystone app backend to Railway. Based on the <InlineCode>with-auth</InlineCode>{' '}
          project. <strong>One-click deployment</strong> included.
        </Well>
      </div>
    </DocsPage>
  )
}
