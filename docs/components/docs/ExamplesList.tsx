
/** @jsxImportSource @emotion/react */

import { Well } from '../primitives/Well'
import { useMediaQuery } from '../../lib/media'
import { InlineCode } from '../../components/primitives/Code'

export function Examples () {
  const mq = useMediaQuery()
  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
        gap: 'var(--space-xlarge)',
      })}
    >
      <Well
        grad="grad3"
        heading="Blog"
        href="https://github.com/keystonejs/keystone/blob/main/examples/usecase-blog"
        target="_blank"
        rel="noreferrer"
      >
        A basic Blog schema with Posts and Authors. Use this as a starting place for learning how to
        use Keystone. It’s also a starter for other feature projects.
      </Well>
      <Well
        grad="grad3"
        heading="Task Manager"
        href="https://github.com/keystonejs/keystone/blob/main/examples/usecase-todo"
        target="_blank"
        rel="noreferrer"
      >
        A basic Task Management app, with Tasks and People who can be assigned to tasks. Great for
        learning how to use Keystone. It’s also a starter for other feature projects.
      </Well>
      <Well
        grad="grad3"
        heading="Extend GraphQL Schema"
        href="https://github.com/keystonejs/keystone/blob/main/examples/extend-graphql-schema"
        target="_blank"
        rel="noreferrer"
      >
        Shows you how to extend the Keystone GraphQL API with custom queries and mutations. Builds
        upon the Blog starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Default Values"
        href="https://github.com/keystonejs/keystone/blob/main/examples/default-values"
        target="_blank"
        rel="noreferrer"
      >
        Demonstrates how to use default values for fields. Builds upon the Task Manager starter
        project.
      </Well>
      <Well
        grad="grad3"
        heading="Virtual fields"
        href="https://github.com/keystonejs/keystone/tree/main/examples/virtual-field"
        target="_blank"
        rel="noreferrer"
      >
        Implements virtual fields in a Keystone list. Builds on the Blog starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Document field"
        href="https://github.com/keystonejs/keystone/tree/main/examples/document-field"
        target="_blank"
        rel="noreferrer"
      >
        Illustrates how to configure <InlineCode>document</InlineCode> fields in your Keystone
        system and render their data in a frontend application. Builds on the Blog starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Testing"
        href="https://github.com/keystonejs/keystone/tree/main/examples/testing"
        target="_blank"
        rel="noreferrer"
      >
        Shows you how to write tests against the GraphQL API to your Keystone system. Builds on the
        Authentication example project.
      </Well>
      <Well
        grad="grad3"
        heading="Authentication"
        href="https://github.com/keystonejs/keystone/tree/main/examples/auth"
        target="_blank"
        rel="noreferrer"
      >
        Adds password-based authentication to the Task Manager starter project.
      </Well>
      <Well
        grad="grad3"
        heading="JSON Field"
        href="https://github.com/keystonejs/keystone/tree/main/examples/json"
        target="_blank"
        rel="noreferrer"
      >
        Illustrates how to use the <InlineCode>json</InlineCode> field type.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Field View"
        href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field-view"
        target="_blank"
        rel="noreferrer"
      >
        Adds a custom Admin UI view to a <InlineCode>json</InlineCode> field which provides a
        customised editing experience for users.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Field Type"
        href="https://github.com/keystonejs/keystone/blob/main/examples/custom-field"
        target="_blank"
        rel="noreferrer"
      >
        Adds a custom field type based on the <InlineCode>integer</InlineCode> field type which lets
        users rate items on a 5-star scale.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Admin UI Pages"
        href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-pages"
        target="_blank"
        rel="noreferrer"
      >
        Adds a custom page in the Admin UI.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Admin UI Logo"
        href="https://github.com/keystonejs/keystone/blob/main/examples/custom-admin-ui-logo"
        target="_blank"
        rel="noreferrer"
      >
        Adds a custom logo component in the Admin UI.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Admin UI Navigation"
        href="https://github.com/keystonejs/keystone/tree/main/examples/custom-admin-ui-navigation"
      >
        Adds a custom Navigation component to the Admin UI.
      </Well>
      <Well
        grad="grad3"
        heading="Document Field Customisation"
        href="https://github.com/keystonejs/keystone/tree/main/examples/document-field-customisation"
      >
        Example to demonstrate customisation of Keystone's document field and document renderer.
      </Well>
    </div>
  )
}
