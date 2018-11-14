const groupBy = require('lodash.groupby');
const pSettle = require('p-settle');
const { intersection, pick } = require('@voussoir/utils');
const { ParameterError } = require('./graphqlErrors');

const NESTED_MUTATIONS = ['create', 'connect', 'disconnect', 'disconnectAll'];

function generateQueueId({ foreign, local }) {
  // The queue id is more than just the id of the item - it's the id + field
  // combo. And since fields could be named the same across lists, we need to
  // include the list name also.
  // TODO: Needs local and foreign info baked into the key.
  const foreignKey = `foreign:${foreign.list.key}.${foreign.field.path}.${foreign.id}`;
  const localKey = `local:${local.list.key}.${local.field.path}.${local.id}`;

  return `${foreignKey}|${localKey}`;
}

function queueIdForDisconnection({ context, foreign, local, done = false }) {
  // We use `context` as it's passed around by graphqljs, so is available
  // everywhere
  context.disconnectQueue = context.disconnectQueue || new Map();
  // NOTE: We don't return these promises, we expect them to be fulfilled at a
  // future date and don't want to wait for them now.
  Promise.all([foreign, local]).then(([foreignInfo, localInfo]) => {
    const queueId = generateQueueId({ foreign: foreignInfo, local: localInfo });
    // It may have already been added elsewhere, so we don't want to add it again
    if (!context.disconnectQueue.has(queueId)) {
      context.disconnectQueue.set(queueId, { foreign: foreignInfo, local: localInfo, done });
    }
  });
}

function flagIdAsDisconnected({ context, foreign, local }) {
  queueIdForDisconnection({ context, foreign, local, done: true });
}

function tellForeignItemToGetQueued(
  queueIdForProcessing,
  flagIdAsDone,
  { context, getItem, local, foreign }
) {
  // queue up the disconnection
  queueIdForProcessing({
    context,
    foreign: getItem.then(item => ({
      ...local,
      id: item.id,
    })),
    local: foreign,
  });

  // To avoid any circular updates with the above disconnect, we flag this
  // item as having already been disconnected
  flagIdAsDone({
    context,
    foreign: foreign,
    local: getItem.then(item => ({
      ...local,
      id: item.id,
    })),
  });
}

function tellForeignItemToDisconnect({ context, getItem, local, foreign }) {
  tellForeignItemToGetQueued(queueIdForDisconnection, flagIdAsDisconnected, {
    context,
    getItem,
    local,
    foreign,
  });
}

function tellForeignItemToConnect({ context, getItem, local, foreign }) {
  tellForeignItemToGetQueued(queueIdForConnection, flagIdAsConnected, {
    context,
    getItem,
    local,
    foreign,
  });
}

function queueIdForConnection({ context, foreign, local, done = false }) {
  // We use `context` as it's passed around by graphqljs, so is available
  // everywhere
  context.connectQueue = context.connectQueue || new Map();

  Promise.all([foreign, local]).then(([foreignInfo, localInfo]) => {
    const queueId = generateQueueId({ foreign: foreignInfo, local: localInfo });
    // It may have already been added elsewhere, so we don't want to add it again
    if (!context.connectQueue.has(queueId)) {
      context.connectQueue.set(queueId, { foreign: foreignInfo, local: localInfo, done });
    }
  });
}

function flagIdAsConnected({ context, foreign, local }) {
  queueIdForConnection({ context, foreign, local, done: true });
}

async function processQueue(queue, processor) {
  if (!queue) {
    return Promise.resolve();
  }

  for (let [queueKey, queuedWork] of queue.entries()) {
    if (queuedWork.done) {
      continue;
    }

    // Flag it as handled so we don't try again in a nested update
    // NOTE: We do this first before any other work below to avoid async issues
    // To avoid issues with looping and Map()s, we directly set the value on the
    // object as stored in the Map, and don't try to update the Map() itself.
    queuedWork.done = true;

    await processor({ ...queuedWork, queueKey });
  }
}

function buildNestedMutation({ foreign, local, operation }) {
  return {
    [local.field.path]: {
      [operation]: local.field.config.many ? [{ id: foreign.id }] : { id: foreign.id },
    },
  };
}

// Returns a promise
function processQueuedDisconnections({ context }) {
  return processQueue(
    context.disconnectQueue,
    // foreign / local from the point of view of the item to be updated.
    ({ foreign, local }) => {
      // Setup the correct mutation query params to perform the disconnection
      const disconnectClause = buildNestedMutation({ foreign, local, operation: 'disconnect' });

      // Trigger the disconnection.
      // NOTE: This relies on the user having `update` permissions on the other
      // list.
      return local.list.updateMutation(local.id, disconnectClause, context);
    }
  );
}

function processQueuedConnections({ context }) {
  return processQueue(
    context.connectQueue,
    // foreign / local from the point of view of the item to be updated.
    ({ foreign, local }) => {
      // Setup the correct mutation query params to perform the disconnection
      const connectClause = buildNestedMutation({ foreign, local, operation: 'connect' });

      // Trigger the disconnection.
      // NOTE: This relies on the user having `update` permissions on the other
      // list.
      return local.list.updateMutation(local.id, connectClause, context);
    }
  );
}

function validateToManyInput({ input, foundMutations, localList, localField, refList }) {
  // to-many must have an array of at least one item with at least one key
  const validInputMutations = foundMutations.filter(
    mutation =>
      mutation === 'disconnectAll' ||
      (Array.isArray(input[mutation]) &&
        input[mutation].filter(item => Object.keys(item).length).length)
  );

  // NOTE: We don't error when _all_ are set in the many case as it's
  // additive
  if (!validInputMutations.length) {
    throw new ParameterError({
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(', ')}) when mutating ${
        localList.key
      }.${localField.path}<${refList.key}>`,
    });
  }

  return pick(input, validInputMutations);
}

function validateToSingleInput({ input, foundMutations, localList, localField, refList }) {
  // to-single must have an item with at least one key
  const validInputMutations = foundMutations.filter(
    mutation => mutation === 'disconnectAll' || Object.keys(input[mutation]).length
  );

  if (!validInputMutations.length) {
    throw new ParameterError({
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(', ')}) when mutating ${
        localList.key
      }.${localField.path}<${refList.key}>`,
    });
  }

  // Can't create AND connect - only one can be set at a time
  if (validInputMutations.includes('create') && validInputMutations.includes('connect')) {
    throw new ParameterError({
      message: `Can only provide one of 'connect' or 'create' when mutating ${localList.key}.${
        localField.path
      }<${refList.key}>`,
    });
  }

  return pick(input, validInputMutations);
}

const cleanAndValidateInput = ({ input, many, localList, localField, refList }) => {
  try {
    const foundMutations = intersection(Object.keys(input), NESTED_MUTATIONS);

    return many
      ? validateToManyInput({ input, foundMutations, localList, localField, refList })
      : validateToSingleInput({ input, foundMutations, localList, localField, refList });
  } catch (error) {
    wrapAndThrowSingleError({
      error,
      message: `Nested mutation operation invalid for  ${localList.key}.${localField.path}<${
        refList.key
      }>`,
      localField,
    });
  }
};

const enhanceSingleError = ({ error, path, localField }) => {
  error.path = [localField.path];

  if (path && error.name !== 'ParameterError') {
    error.path.push(...(Array.isArray(path) ? path : [path]));
  }

  return error;
};

const wrapAndThrowSingleError = ({ error, message, path, localField }) => {
  const wrappingError = new Error(message);

  enhanceSingleError({ error, path, localField });

  wrappingError.errors = [error];

  throw wrappingError;
};

const cleanOrThrowSettled = settled => {
  const errored = settled.filter(({ isRejected }) => isRejected);

  if (errored.length) {
    const wrappingError = new Error();
    wrappingError.errors = errored;
    throw wrappingError;
  }

  // At this point, we know everything resolved successfully
  // Map back from `p-settle`'s data structure to the raw value
  return settled.map(({ value }) => value);
};

const settleToItem = (collection, action) => {
  return pSettle(
    collection.map(item => action(item))
    // Inject the index as a key into the settled data for later use
  ).then(settled => settled.map((settleInfo, index) => ({ ...settleInfo, index })));
};

function settleUniqueItems({ refList, context, wheres }) {
  return settleToItem(
    wheres,
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    where =>
      refList.singleItemResolver({
        id: where.id,
        context,
        name: refList.gqlNames.itemQueryName,
      })
  );
}

const resolveDisconnectItems = async ({ refList, context, wheres = [] }) => {
  const settled = await settleUniqueItems({ refList, context, wheres });

  // We don't throw if any fail; we're only interested in the ones this user has
  // access to read (and hence remove from the list)
  return settled.filter(({ isFulfilled }) => isFulfilled).map(({ value }) => value);
};

const resolveManyUniqueItems = async ({ refList, context, wheres = [] }) => {
  const settled = await settleUniqueItems({ refList, context, wheres });

  return cleanOrThrowSettled(settled);
};

const resolveManyCreates = async ({ refList, context, datasets = [] }) => {
  const settled = await settleToItem(
    datasets,
    // Create related item. Will check for access control itself, no need to
    // do anything extra here.
    data => refList.createMutation(data, context)
  );

  // NOTE: We don't check for read access control on the returned ids as the
  // user will not have seen it, so it's ok to return it directly here.
  return cleanOrThrowSettled(settled);
};

const trySingleGet = async ({ refList, wheres, localList, localField, context }) => {
  // input is of type *RelateToOneInput
  try {
    const [item] = await resolveManyUniqueItems({
      refList,
      context,
      wheres,
    });
    return item;
  } catch (error) {
    wrapAndThrowSingleError({
      error: error.errors[0].reason,
      message: `Unable to connect a ${refList.key} as set on ${localList.key}.${localField.path}`,
      path: 'connect',
      localField,
    });
  }
};

const trySingleCreateAndGet = async ({ refList, input, localList, localField, context }) => {
  try {
    const [item] = await resolveManyCreates({ refList, context, datasets: [input.create] });
    return item;
  } catch (error) {
    wrapAndThrowSingleError({
      error: error.errors[0].reason,
      message: `Unable to create a new ${refList.key} as set on ${localList.key}.${
        localField.path
      }`,
      path: 'create',
      localField,
    });
  }
};

const openDatabaseTransaction = () => {
  // TODO: Implement transactions
  return {
    rollback: () => {},
    commit: () => {},
  };
};

async function toManyNestedMutation({
  currentValue,
  refList,
  refField,
  input,
  getItem,
  context,
  localList,
  localField,
}) {
  // Multiple items received
  let connectedItems = [];
  let connectErrors = [];

  let disconnectIds = [];

  let createdItems = [];
  let createErrors = [];

  // Convert the ObjectIds to strings
  let valuesToKeep = (currentValue || []).map(value => value.toString());

  if (input.disconnectAll) {
    disconnectIds = [...valuesToKeep];
  } else if (input.disconnect) {
    // We want to avoid DB lookups where possible, so we split the input into
    // two halves; one with ids, and the other without ids
    const { withId, withoutId } = groupBy(input.disconnect, ({ id }) =>
      id ? 'withId' : 'withoutId'
    );

    if (withId && withId.length) {
      // We set the Ids we do find immediately
      disconnectIds = withId.map(({ id }) => id);
    }

    // And any without ids (ie; other unique criteria), have to be looked up
    if (withoutId && withoutId.length) {
      const disconnectItems = await resolveDisconnectItems({
        refList,
        wheres: input.disconnect,
        context,
      });

      disconnectIds.push(
        ...disconnectItems
          // Possible to get null results when the id doesn't exist, or read access is
          // denied
          .filter(itemToDisconnect => itemToDisconnect)
          .map(({ id }) => id.toString())
      );
    }
  }

  if (refField) {
    disconnectIds.forEach(idToDisconnect => {
      tellForeignItemToDisconnect({
        context,
        getItem,
        local: {
          list: localList,
          field: localField,
        },
        foreign: {
          list: refList,
          field: refField,
          id: idToDisconnect,
        },
      });
    });
  }

  try {
    connectedItems = await resolveManyUniqueItems({ refList, wheres: input.connect, context });
  } catch (error) {
    connectErrors = error.errors.map(({ reason, index }) =>
      enhanceSingleError({ error: reason, path: ['connect', index], localField })
    );
  }

  try {
    createdItems = await resolveManyCreates({ refList, datasets: input.create, context });
  } catch (error) {
    createErrors = error.errors.map(({ reason, index }) =>
      enhanceSingleError({ error: reason, path: ['create', index], localField })
    );
  }

  // Combine and map the data in the format we actually need
  // Created items now get connected too, so they're coming along for the ride!
  connectedItems = [...connectedItems, ...createdItems]
    // Possible to get null results when the id doesn't exist, or read access is
    // denied
    .filter(itemConnected => itemConnected)
    .map(({ id }) => id);

  if (refField) {
    connectedItems.forEach(idToConnect => {
      // At this point, we've not actually added the ID `idToConnect` to the
      // field `localField` on list `localList`, just flagged it needing to be added.
      // This is so any recursive checks don't attempt to do it again.
      tellForeignItemToConnect({
        context,
        getItem,
        local: {
          list: localList,
          field: localField,
        },
        foreign: {
          list: refList,
          field: refField,
          id: idToConnect,
        },
      });
    });
  }

  if (connectErrors.length || createErrors.length) {
    const error = new Error(
      `Unable to create and/or connect ${createErrors.length + connectErrors.length} ${
        refList.key
      } as set on ${localList.key}.${localField.path}`
    );

    error.errors = [...connectErrors, ...createErrors];

    throw error;
  }

  // When there are items to disconnect, we want to remove them from the
  // 'to-keep array'
  if (disconnectIds.length) {
    valuesToKeep = valuesToKeep.filter(keepCandidate => !disconnectIds.includes(keepCandidate));
  }

  return [...valuesToKeep, ...connectedItems];
}

async function toSingleNestedMutation({
  currentValue,
  localList,
  localField,
  refList,
  refField,
  input,
  getItem,
  context,
}) {
  let result = currentValue;

  if (currentValue && (input.disconnect || input.disconnectAll)) {
    let idToDisconnect;
    if (input.disconnectAll) {
      idToDisconnect = currentValue.toString();
    } else if (input.disconnect.id) {
      idToDisconnect = input.disconnect.id;
    } else {
      try {
        // Support other unique fields for disconnection
        const itemToDisconnect = await trySingleGet({
          refList,
          wheres: [input.disconnect],
          localList,
          localField,
          context,
        });
        idToDisconnect = itemToDisconnect.id.toString();
      } catch (error) {
        // Maybe we don't have read access, or maybe the item doesn't exist
        // (recently deleted, or it's an erroneous value in the relationship
        // field)
        // So we silently ignore it
      }
    }

    if (currentValue.toString() === idToDisconnect) {
      // Found the item, so unset it
      result = null;

      if (refField) {
        // At this point, we've not actually removed the ID `idToDisconnect`
        // from the field `localField` on list `localList`, but instead flagged
        // it for removal (by setting `result = null`).
        tellForeignItemToDisconnect({
          context,
          getItem,
          local: {
            list: localList,
            field: localField,
          },
          foreign: {
            list: refList,
            field: refField,
            id: idToDisconnect,
          },
        });
      }
    }
  }

  if (input.connect) {
    // override result with the connected value
    const itemToConnect = await trySingleGet({
      refList,
      wheres: [{ id: input.connect.id }],
      localList,
      localField,
      context,
    });

    // Can happen when the input id doesn't exist / the user doesn't have read
    // access
    if (!itemToConnect) {
      return undefined;
    }

    if (refField) {
      // At this point, we've not actually added the ID `itemToConnect.id` to the
      // field `localField` on list `localList`, just flagged it needing to be added.
      // This is so any recursive checks don't attempt to do it again.
      tellForeignItemToConnect({
        context,
        getItem,
        local: {
          list: localList,
          field: localField,
        },
        foreign: {
          list: refList,
          field: refField,
          id: itemToConnect.id,
        },
      });
    }

    return itemToConnect.id;
  }

  if (input.create) {
    // override result with the created value
    const itemCreated = await trySingleCreateAndGet({
      refList,
      input,
      localList,
      localField,
      context,
    });

    if (refField) {
      // At this point, we've not actually added the ID `itemToConnect.id` to the
      // field `localField` on list `localList`, just flagged it needing to be added.
      // This is so any recursive checks don't attempt to do it again.
      tellForeignItemToConnect({
        context,
        getItem,
        local: {
          list: localList,
          field: localField,
        },
        foreign: {
          list: refList,
          field: refField,
          id: itemCreated.id,
        },
      });
    }

    return itemCreated.id;
  }

  return result;
}

async function nestedMutation({
  input,
  currentValue,
  many,
  getItem,
  localList,
  localField,
  refList,
  refField,
  context,
}) {
  const cleanInput = cleanAndValidateInput({ input, many, localList, localField, refList });

  const transaction = await openDatabaseTransaction();

  try {
    const result = many
      ? await toManyNestedMutation({
          currentValue,
          refList,
          refField,
          input: cleanInput,
          getItem,
          context,
          localList,
          localField,
        })
      : await toSingleNestedMutation({
          currentValue,
          refList,
          refField,
          input: cleanInput,
          getItem,
          localList,
          localField,
          context,
        });
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  nestedMutation,
  processQueuedDisconnections,
  processQueuedConnections,
  tellForeignItemToDisconnect,
};
