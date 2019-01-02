import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient, { gql } from 'apollo-boost';
import { Mutation, ApolloProvider, Query } from 'react-apollo';
import { jsx, Global } from '@emotion/core';

/* @jsx jsx */

const client = new ApolloClient({
  uri: '/admin/api',
});

const GET_TODOS = gql`
  {
    allTodos {
      name
      id
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($type: String!) {
    createTodo(data: { name: $type }) {
      name
      id
    }
  }
`;

const REMOVE_TODO = gql`
  mutation RemoveTodo($id: ID!) {
    deleteTodo(id: $id) {
      name
      id
    }
  }
`;

const Form = () => {
  let input;

  return (
    <Mutation
      mutation={ADD_TODO}
      update={(cache, { data: { createTodo } }) => {
        const { allTodos } = cache.readQuery({ query: GET_TODOS });
        cache.writeQuery({
          query: GET_TODOS,
          data: { allTodos: allTodos.concat([createTodo]) },
        });
      }}
    >
      {createTodo => (
        <div>
          <form
            onSubmit={e => {
              e.preventDefault();
              createTodo({ variables: { type: input.value } });
              input.value = '';
            }}
          >
            <input
              placeholder="Add new item"
              css={{
                padding: '12px 16px',
                fontSize: '1.25em',
                width: '100%',
                borderRadius: 6,
                border: 0,
                background: '#BCDEFA',
                '::placeholder': { color: '#2779BD' },
                ':focus': { outlineColor: '#2779BD' },
              }}
              ref={node => {
                input = node;
              }}
            />
          </form>
        </div>
      )}
    </Mutation>
  );
};

const Trash = () => (
  <svg viewBox="0 0 14 16" css={{ width: 20, height: 20, fill: '#6CB2EB' }}>
    <title>Delete this item</title>
    <path
      fillRule="evenodd"
      d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
    />
  </svg>
);

const Card = data => (
  <Mutation
    mutation={REMOVE_TODO}
    update={(cache, { data: { deleteTodo } }) => {
      const { allTodos } = cache.readQuery({ query: GET_TODOS });
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          allTodos: allTodos.filter(todo => {
            return todo.id != deleteTodo.id;
          }),
        },
      });
    }}
  >
    {removeTodo => (
      <li
        css={{
          padding: '32px 16px',
          color: '#12283A',
          fontSize: '1.25em',
          fontWeight: 600,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          margin: '0 0 16px 0',
          background: '#FFFFFF',
          borderRadius: 6,
          boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
        }}
      >
        {data.todo.name}
        <button
          css={{
            background: 0,
            border: 0,
            padding: 0,
          }}
          onClick={e => {
            e.preventDefault();
            removeTodo({ variables: { id: data.todo.id } });
          }}
        >
          <Trash />
        </button>
      </li>
    )}
  </Mutation>
);

const App = () => (
  <ApolloProvider client={client}>
    <Global
      styles={{
        body: {
          background: '#EFF8FF',
          fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
        },
        '*': { boxSizing: 'border-box' },
      }}
    />
    <div css={{ padding: 50, maxWidth: 450 }}>
      <h1 css={{ color: '#12283A', textTransform: 'uppercase', fontWeight: 900, marginTop: 0 }}>
        To-Do List
      </h1>
      <Form />
      <Query query={GET_TODOS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) return <p>Error!</p>;
          return (
            <ul css={{ listStyle: 'none', padding: 0 }}>
              {data.allTodos.map((todo, index) => (
                <Card todo={todo} key={index} />
              ))}
            </ul>
          );
        }}
      </Query>
    </div>
  </ApolloProvider>
);

ReactDOM.render(<App />, document.getElementById('app'));
