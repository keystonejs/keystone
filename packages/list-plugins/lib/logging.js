const logging = (loggingFn = s => console.log(JSON.stringify(s))) => ({ hooks = {}, ...rest }) => ({
  hooks: {
    ...hooks,
    afterChange: async args => {
      if (hooks.afterChange) {
        await hooks.afterChange(args);
      }
      const { operation, existingItem, originalInput, updatedItem, context, listKey } = args;
      const { authedItem, authedListKey } = context;
      if (operation === 'create') {
        loggingFn({
          operation,
          authedItem,
          authedListKey,
          originalInput,
          listKey,
          createdItem: updatedItem,
        });
      } else if (operation === 'update') {
        const changedItem = Object.entries(updatedItem)
          .filter(([key, value]) => key === 'id' || value !== existingItem[key])
          .reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
          }, {});
        loggingFn({ operation, authedItem, authedListKey, originalInput, listKey, changedItem });
      }
    },
    afterDelete: async args => {
      if (hooks.afterDelete) {
        await hooks.afterDelete(args);
      }
      const { operation, existingItem, context, listKey } = args;
      const { authedItem, authedListKey } = context;
      loggingFn({ operation, authedItem, authedListKey, listKey, deletedItem: existingItem });
    },
    afterAuth: async args => {
      if (hooks.afterAuth) {
        await hooks.afterAuth(args);
      }
      const { operation, item, success, message, token, context, listKey } = args;
      const { authedItem, authedListKey } = context;
      loggingFn({ operation, authedItem, authedListKey, item, success, message, token, listKey });
    },
    afterUnauth: async args => {
      if (hooks.afterAuth) {
        await hooks.afterAuth(args);
      }
      const { operation, context, listKey, itemId } = args;
      const { authedItem, authedListKey } = context;
      loggingFn({ operation, authedItem, authedListKey, listKey, itemId });
    },
  },
  ...rest,
});

module.exports = { logging };
