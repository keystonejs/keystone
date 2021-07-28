/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Well } from '../primitives/Well';
import { useMediaQuery } from '../../lib/media';
import { InlineCode } from '../../components/primitives/Code';

export function Examples() {
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
        grad="grad3"
        heading="Blog"
        href="https://github.com/keystonejs/keystone/blob/master/examples/blog"
        target="_blank"
        rel="noopener noreferrer"
      >
        A basic Blog schema with Posts and Authors. Use this as a starting place for learning how to
        use Keystone. It’s also a starter for other feature projects.
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
        Demonstrates how to use default values for fields. Builds upon the Task Manager starter
        project.
      </Well>
      <Well
        grad="grad3"
        heading="Virtual fields"
        href="https://github.com/keystonejs/keystone/tree/master/examples/virtual-field"
        target="_blank"
        rel="noopener noreferrer"
      >
        Implements virtual fields in a Keystone list. Builds on the Blog starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Document field"
        href="https://github.com/keystonejs/keystone/tree/master/examples/document-field"
        target="_blank"
        rel="noopener noreferrer"
      >
        Illustrates how to configure <InlineCode>document</InlineCode> fields in your Keystone
        system and render their data in a frontend application. Builds on the Blog starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Testing"
        href="https://github.com/keystonejs/keystone/tree/master/examples/testing"
        target="_blank"
        rel="noopener noreferrer"
      >
        Shows you how to write tests against the GraphQL API to your Keystone system. Builds on the
        Authentication example project.
      </Well>
      <Well
        grad="grad3"
        heading="Authentication"
        href="https://github.com/keystonejs/keystone/tree/master/examples/with-auth"
        target="_blank"
        rel="noopener noreferrer"
      >
        Adds password-based authentication to the Task Manager starter project.
      </Well>
      <Well
        grad="grad3"
        heading="JSON Field"
        href="https://github.com/keystonejs/keystone/tree/master/examples/json"
        target="_blank"
        rel="noopener noreferrer"
      >
        Illustrates how to use the <InlineCode>json</InlineCode> field type. Builds on the Task
        Manager starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Field View"
        href="https://github.com/keystonejs/keystone/blob/master/examples/custom-field-view"
        target="_blank"
        rel="noopener noreferrer"
      >
        Adds a custom Admin UI view to a <InlineCode>json</InlineCode> field which provides a
        customised editing experience for users. Builds on the Task Manager starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Field Type"
        href="https://github.com/keystonejs/keystone/blob/master/examples/custom-field"
        target="_blank"
        rel="noopener noreferrer"
      >
        Adds a custom field type based on the <InlineCode>integer</InlineCode> field type which lets
        users rate items on a 5-star scale. Builds on the Blog starter project.
      </Well>
      <Well
        heading="Custom Admin UI Pages"
        href="https://github.com/keystonejs/keystone/blob/master/examples/custom-admin-ui-pages"
        target="_blank"
        rel="noopener noreferrer"
      >
        Adds a custom page in the Admin UI. Builds on the Task Manager starter project.
      </Well>
      <Well
        grad="grad3"
        heading="Custom Admin UI Logo"
        href="https://github.com/keystonejs/keystone/blob/master/examples/custom-admin-ui-logo"
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
        Adds a custom Navigation component to the Admin-UI. Builds on the Task Manager starter
        project.
      </Well>
    </div>
  );
}
