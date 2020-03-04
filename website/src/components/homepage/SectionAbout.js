/** @jsx jsx */
import { jsx } from '@emotion/core';
import Highlight, { defaultProps } from 'prism-react-renderer';

import { HomepageSection } from './HomepageSection';
import prismTheme from '../../prism-themes/custom';
import { colors } from '@arch-ui/theme/src';

const cards = [
  {
    language: `js`,
    code: `// Define your schema

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
    code: `// Generated GraphQL schema

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

const SectionAbout = () => (
  <HomepageSection
    variant="dark"
    description="A KeystoneJS instance can be summarised as a function of your schema which creates a GraphQL API for querying, and an AdminUI for managing your data."
    heading="schema => ({ GraphQL, AdminUI })"
    ctaTo="guides/schema"
    ctaText="Read more"
  >
    <Grid>
      {cards.map((card, i) => (
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
      gridTemplateColumns: '1fr 1fr',
      gridGap: '1.5rem',
    }}
    {...props}
  />
);

const Card = props => (
  <div
    css={{
      boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
      backgroundColor: colors.N100,
      borderRadius: 4,
      padding: '1rem',
      overflow: 'scroll',
    }}
    {...props}
  />
);

export { SectionAbout };
