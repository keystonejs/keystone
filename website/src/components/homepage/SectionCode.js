/** @jsx jsx */
import { jsx } from '@emotion/core';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { colors } from '@arch-ui/theme/src';

import { HomepageSection } from './HomepageSection';
import prismTheme from '../../prism-themes/custom';
import { media } from '../../utils/media';

const CARDS = [
  {
    language: `js`,
    code: `// Define your \`lists\` and \`fields\`

keystone.createList('Todo', {
  fields: {
    task: { type: Text },
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
});`,
  },
  {
    language: `graphql`,
    code: `# Generated GraphQL schema

type Mutation {
  createTodo(..): Todo
  updateTodo(..): Todo
  deleteTodo(..): Todo
  createUser(..): User
  updateUser(..): User
  deleteUser(..): User
}

type Query {
  allTodos(..): [Todo]
  Todo(..): Todo
  allUsers(..): [User]
  User(..): User
}

type Todo {
  id: ID
  task: String
}

type User {
  id: ID
  name: String
  email: String
}`,
  },
];

const SectionCode = () => (
  <HomepageSection
    variant="dark"
    description="A KeystoneJS instance acts as a function of your schema which creates a GraphQL API for querying and an Admin UI for managing your data."
    heading="schema => ({ GraphQL, AdminUI })"
    ctaTo="guides/schema"
    ctaText="Learn more about lists and fields"
  >
    <Grid>
      {CARDS.map((card, i) => (
        <Card key={i}>
          <Highlight {...defaultProps} theme={prismTheme} code={card.code} language={card.language}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={className} style={style}>
                {tokens.map((line, i) => (
                  <div {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </Card>
      ))}
    </Grid>
  </HomepageSection>
);

const Grid = props => (
  <div
    css={{
      display: 'grid',
      gridGap: '1rem',

      [media.sm]: {
        gridGap: '1.5rem',
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    }}
    {...props}
  />
);

const Card = props => (
  <div
    css={{
      boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
      backgroundColor: colors.N100,
      borderRadius: 8,
      padding: '1rem',
      overflow: 'auto',
    }}
    {...props}
  />
);

export { SectionCode };
