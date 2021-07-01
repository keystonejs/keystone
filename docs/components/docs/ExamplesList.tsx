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
    </div>
  );
}
