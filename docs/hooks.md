# Hooks

The field and user-land/list hooks/resolveInput/validateInput/... functions are "safe zones" (?).
They're run inside a `try/catch` block; any standard JS `Errors` are caught and converted to

# Open questions

- If a field type has it's own hooks (e.g. File upload), how do user overrides work...?
- Do we need both the 'auth' and 'context' parameters?
- When applying field hooks, do we apply them to all fields on the list, or just those supplied?
  - A: I think we need to do it on all fields, so we can do things like set defaults...

## Field Type Hooks

```js
class Text extends Implementation {
  // ...

  // Run on create or update of an item
  // Modifies the field's values in the "input"
  // input - input is the complete user input (for the item)
  // existingItem - is the complete item currently stored (if it exists)
  async resolveInput(input, existingItem, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) {
    if (!existingItem && this.default && !input[this.path]) {

      // Any failures or errors _thrown_ will be presented back to the interface
      if (condition) throw new Error(/* ... */);
      if (otherCondition) throw new Failure(/* ... */);

      // Hooks can supply steps to manually rollback external operations
      const result = await uploadSomething();
      addRollbackStep(() => { deleteThingWeUploaded(result); });

      // The list plucks the field's values from this return
      // (See.. https://github.com/keystonejs/keystone-5/issues/239)
      // and merges them back in to the `input` value
      return { [this.path]: this.default };
    }
    // If nothing is return, the values aren't modified
    return;
  }

  // Returns either:
  //  - A single failure
  //  - An array of failures
  //  - undefined
  // Or throws any one or more failures
  async validateInput(input, existingItem, addValidationError, { auth: { listKey, itemId, item }, adapter, transaction, originalInput, graphQLContext }) {
    if (this.minLength && data && data.length < this.minLength) {
      addValidationError('Value needs to be longer!');
    }
    if (this.isRequired && !data) {
      addValidationError(new Failure('Value needs to be supplied!'));
    }
  }

  // Last chance to do something before you hit the DB
  async beforeChange(input, existingItem, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, originalInput, graphQLContext }) {
    // Side effects only
    // addRollbackStep() if possible
    // No return
  }

  // updatedItem: the new/updated record from the DB (read back out)
  // Aka.. resolveOutput?
  async afterChange(updatedItem, oldItem, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, originalInput, resolvedInput, graphQLContext }) {
    // Side effects and stuff
    // throw error

    // Can alter/dictate the item data to send back to the client (for the values controlled by this field)
    // Or undefined (which defaults to the `updatedItem` values)
    return { [this.path]: 'something different' };
  }


  async validateDelete(item, addValidationError, { auth: { listKey, itemId, item }, adapter, transaction, graphQLContext }) {
    // Prevent the delete from continuing
    addValidationError(new Failure('bad things'));
  }
  async beforeDelete(item, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) {
    // Side effects and stuff
    // throw error
  }
  async afterDelete(item, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) {
    // Side effects and stuff
    // throw error
  }

}
```

## List Hooks

```js
keystone.createList('User', {
  fields: {
    name: { type: Text, minLength: 3 },
    email: { type: Text, isRequired: true, isUnique: true },
    pass: { type: Password, rejectCommon: true },
  },

  hooks: {
    // Run _after_ the field level resolveInput() functions (which happen in parallel)
    resolveInput: async (input, existingItem, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) => {
      // Same as field level but can return the entire item/input
      // .. Or undefined
    },

    validateInput: async (input, existingItem, addValidationError, { auth: { listKey, itemId, item }, adapter, transaction, originalInput, graphQLContext }) => {
      // Same as field level but can return the entire item/input
      // .. Or undefined
    },

    // Last chance to do something before you hit the DB
    beforeChange: async (input, existingItem, { auth: { listKey, itemId, item }, adapter, transaction, originalInput, graphQLContext }) => {
      // Side effects only
      // No return
    },

    afterChange: async (updatedItem, preexistingItem, { auth: { listKey, itemId, item }, adapter, transaction, originalInput, resolvedInput, graphQLContext, updateItem }) => {
      // Side effects and stuff
      // throw error

      // Can alter/dictate the item data to send back to the client (for the whole items)
      // Or undefined (which defaults to the `updatedItem`)
      return updatedItem;

      // Or maybe this is better..?
      updateItem({ additonal: true });
    },

    // Deleting

    validateDelete: async (item, addValidationError, { auth: { listKey, itemId, item }, adapter, transaction, graphQLContext }) => {
      // Prevent the delete from continuing
      addValidationError(new Failure('bad things'));
    }
    beforeDelete: async (item, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) => {
      // Side effects and stuff
      // throw error
    }
    afterDelete: async (item, { auth: { listKey, itemId, item }, adapter, transaction, addRollbackStep, graphQLContext }) => {
      // Side effects and stuff
      // throw error
    }
  }
});
```

## Pipeline

Applied on the GraphQL layer:

1. Access control
2. List operation, below

Applied by the internal list API:

1. Field type `resolveInput()` functions in parallel
2. List level `resolveInput()` function
3. Field type `validateInput()` functions in parallel
4. List level `validateInput()` function
5. Field type `beforeChange()` functions in parallel
6. List level `beforeChange()` function
7. DB operation, as per adapter
8. Field type `afterChange()` functions in parallel??
9. List level `afterChange()` function

If anything is thrown (uncaught) before step 8:

- The pipeline halts/returned immediately
- Any registered rollback steps are run
- DB transaction rolled back
- Returned as a failure

Any failures in Step 8 or 9 are caught, but do not halt processing of further `afterChange()` calls, because at this point there is no rollback. Any errors are reported to the user.
