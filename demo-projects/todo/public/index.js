import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient, { gql } from 'apollo-boost';
import { Mutation, ApolloProvider, Query } from 'react-apollo';

const tint = (opacity, darkness) =>
  `hsla(261, 84%, ${darkness == 'dark' ? '14%' : darkness == 'light' ? '95%' : '60%'}, ${opacity ||
    1})`;

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

        allTodos.push(createTodo);

        cache.writeQuery({
          query: GET_TODOS,
          data: { allTodos },
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
              style={{
                color: tint(1, 'dark'),
                padding: '12px 16px',
                fontSize: '1.25em',
                width: '100%',
                borderRadius: 6,
                border: 0,
                background: tint(0.3),
              }}
              className="addItem"
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

const Item = data => (
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
        style={{
          padding: '32px 16px',
          fontSize: '1.25em',
          fontWeight: 600,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${tint(0.2)}`,
        }}
      >
        {data.todo.name}
        <button
          style={{
            background: 0,
            border: 0,
            padding: 0,
            cursor: 'pointer',
          }}
          className="trash"
          onClick={e => {
            e.preventDefault();
            removeTodo({ variables: { id: data.todo.id } });
          }}
        >
          <svg viewBox="0 0 14 16" style={{ width: 20, height: 20, fill: tint() }}>
            <title>Delete this item</title>
            <path
              fillRule="evenodd"
              d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
            />
          </svg>
        </button>
      </li>
    )}
  </Mutation>
);

const App = () => (
  <ApolloProvider client={client}>
    <div
      style={{
        padding: 50,
        maxWidth: 450,
        color: tint(1, 'dark'),
        fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
      }}
    >
      <h1 style={{ textTransform: 'uppercase', fontWeight: 900, marginTop: 0 }}>To-Do List</h1>
      <Form />
      <Query query={GET_TODOS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) return <p>Error!</p>;
          return (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[...data.allTodos].reverse().map((todo, index) => (
                <Item todo={todo} key={index} />
              ))}
            </ul>
          );
        }}
      </Query>
    </div>
  </ApolloProvider>
);

ReactDOM.render(<App />, document.getElementById('app'));
