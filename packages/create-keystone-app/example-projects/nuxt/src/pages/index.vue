<template>
  <div class="app">
    <h1 class="main-heading">Welcome to Keystone 5!</h1>
    <p class="intro-text">
      Here's a simple
      <a href="https://nuxtjs.org">NuxtJS</a> demo app that lets you add/remove todo items. Create a few entries, then go
      check them out from your
      <a
        href="/admin"
      >Keystone 5 Admin UI</a>!
    </p>
    <hr class="divider" />
    <div class="form-wrapper">
      <h2 class="app-heading">To-Do List</h2>

      <!-- Add todo form -->
      <div>
        <form @submit.prevent="addTodo">
          <input
            v-model="newTodo"
            required
            name="add-item"
            placeholder="Add new item"
            class="form-input add-item"
          />
        </form>
      </div>

      <!-- Todo list -->
      <div class="results">
        <!-- If there are no todos... -->
        <p v-if="!todos.length">loading...</p>
        <!-- If there are some... -->
        <ul v-else class="list">
          <li v-for="todo in todos" :key="todo.id" class="list-item">
            {{ todo.name }}
            <!-- Remove button -->
            <button @click="removeTodo(todo.id)" class="remove-item">
              <svg viewBox="0 0 14 16" class="delete-icon">
                <title>Delete this item</title>
                <path
                  fill-rule="evenodd"
                  d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
                />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
/** 
  GraphQL Queries & Mutations
*/
const GET_TODOS = `
  query GetTodos {
    allTodos {
      name
      id
    }
  }
`;

const ADD_TODO = `
    mutation AddTodo($name: String!) {
      createTodo(data: { name: $name }) {
        name
        id
      }
    }
  `;

const REMOVE_TODO = `
    mutation RemoveTodo($id: ID!) {
      deleteTodo(id: $id) {
        name
        id
      }
    }
  `;

function graphql(query, variables = {}) {
  return fetch('http://localhost:3000/admin/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables,
      query,
    }),
  }).then(function(result) {
    return result.json();
  });
}

export default {
  head: {
    title: 'Home page',
  },
  data() {
    return {
      newTodo: '',
      todos: [],
    };
  },
  // Get the todo items on server side
  async asyncData() {
    const { data } = await graphql(GET_TODOS);
    return {
      todos: data.allTodos,
    };
  },

  methods: {
    async getTodos() {
      const { data } = await graphql(GET_TODOS);
      this.todos = data.allTodos;
    },
    async addTodo() {
      if (this.newTodo.length === 0) {
        return;
      }
      // Add todo to list
      await graphql(ADD_TODO, { name: this.newTodo });
      // Reset the input field value
      this.newTodo = '';
      // Update the todo list
      this.getTodos();
    },

    async removeTodo(id) {
      await graphql(REMOVE_TODO, { id });
      // Update the todo list
      this.getTodos();
    },
  },
};
</script>


<style>
*,
*:before,
*:after {
  box-sizing: border-box;
}
body,
html {
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, sans-serif;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.add-item::placeholder {
  color: hsla(220, 30%, 60%, 0.8);
}
.add-item:focus {
  outline: solid 2px hsl(220, 70%, 60%);
}
.remove-item:focus {
  border-bottom: solid 2px hsl(220, 70%, 60%);
}
.remove-item {
  background: transparent;
  outline: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.app {
  margin: 20px 20px;
  padding: 20px;
  max-width: 600px;
  background: #fff;
  border-radius: 18px;
  border: solid 3px hsl(220, 70%, 60%, 0.8);
  color: hsla(220, 84%, 14%, 1);
}

@media (min-width: 550px) {
  .app {
    margin: 10vh 10vw;
    padding: 50px;
  }
}

.main-heading {
  font-weight: 900;
}

.intro-text {
  line-height: 1.5;
  color: hsla(220, 84%, 14%, 0.6);
}

.divider {
  margin-top: 30px;
  margin-left: 0;
  width: 48px;
  height: 4px;
  border-width: 0;
  background-color: hsla(220, 84%, 60%, 1);
}

.form-wrapper {
  max-width: 500;
}

.app-heading {
  text-transform: uppercase;
  font-weight: 900;
  margin-top: 50px;
}

.form-input {
  color: hsla(220, 84%, 14%, 0.6);
  padding: 12px 16px;
  font-size: 1.25em;
  width: 100%;
  border-radius: 6;
  border: 0;
  border: solid 1px hsl(220, 30%, 70%);
  background: hsl(220, 84%, 98%);
}

.list {
  list-style: none;
  padding: 0;
}

.list-item {
  padding: 32px 16px;
  font-size: 1.25em;
  font-weight: 600;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid hsla(220, 84%, 60%, 0.32);
}

.delete-icon {
  width: 20px;
  height: 20px;
  fill: hsla(220, 84%, 60%, 1);
}
</style>