const pSettle = require('p-settle');
const { intersection, pick } = require('@keystonejs/utils');
const { ParameterError } = require('./graphqlErrors');

const NESTED_MUTATIONS = ['create', 'connect', 'disconnect', 'disconnectAll'];

function validateToManyInput({ input, foundMutations, listKey, fieldKey, ref }) {
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
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(
        ', '
      )}) when mutating ${listKey}.${fieldKey}<${ref}>`,
    });
  }

  return pick(input, validInputMutations);
}

function validateToSingleInput({ input, foundMutations, listKey, fieldKey, ref }) {
  // to-single must have an item with at least one key
  const validInputMutations = foundMutations.filter(
    mutation => mutation === 'disconnectAll' || Object.keys(input[mutation]).length
  );

  if (!validInputMutations.length) {
    throw new ParameterError({
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(
        ', '
      )}) when mutating ${listKey}.${fieldKey}<${ref}>`,
    });
  }

  // Can't create AND connect - only one can be set at a time
  if (validInputMutations.includes('create') && validInputMutations.includes('connect')) {
    throw new ParameterError({
      message: `Can only provide one of 'connect' or 'create' when mutating ${listKey}.${fieldKey}<${ref}>`,
    });
  }

  return pick(input, validInputMutations);
}

const cleanAndValidateInput = ({ input, many, listKey, fieldKey, ref }) => {
  try {
    const foundMutations = intersection(Object.keys(input), NESTED_MUTATIONS);

    return many
      ? validateToManyInput({ input, foundMutations, listKey, fieldKey, ref })
      : validateToSingleInput({ input, foundMutations, listKey, fieldKey, ref });
  } catch (error) {
    wrapAndThrowSingleError({
      error,
      message: `Nested mutation operation invalid for  ${listKey}.${fieldKey}<${ref}>`,
      fieldKey,
    });
  }
};

const enhanceSingleError = ({ error, path, fieldKey }) => {
  error.path = [fieldKey];

  if (path && error.name !== 'ParameterError') {
    error.path.push(...(Array.isArray(path) ? path : [path]));
  }

  return error;
};

const wrapAndThrowSingleError = ({ error, message, path, fieldKey }) => {
  const wrappingError = new Error(message);

  enhanceSingleError({ error, path, fieldKey });

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

const settleToId = (collection, action) => {
  return pSettle(
    collection.map(item => action(item))
    // Inject the index as a key into the settled data for later use
  ).then(items => items.map((item, index) => ({ ...item, index })));
};

function settleUniqueItems({ refList, context, wheres }) {
  return settleToId(
    wheres,
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    where =>
      refList
        .singleItemResolver({
          id: where.id,
          context,
          name: refList.gqlNames.itemQueryName,
        })
        .then(({ id }) => id)
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
  const settled = await settleToId(
    datasets,
    // Create related item. Will check for access control itself, no need to
    // do anything extra here.
    data => refList.createMutation(data, context).then(({ id }) => id)
  );

  // NOTE: We don't check for read access control on the returned ids as the
  // user will not have seen it, so it's ok to return it directly here.
  return cleanOrThrowSettled(settled);
};

const trySingleGet = async ({ refList, wheres, ref, listKey, fieldKey, context }) => {
  // input is of type *RelateToOneInput
  try {
    const [id] = await resolveManyUniqueItems({
      refList,
      context,
      wheres,
    });
    return id;
  } catch (error) {
    wrapAndThrowSingleError({
      error: error.errors[0].reason,
      message: `Unable to connect a ${ref} as set on ${listKey}.${fieldKey}`,
      path: 'connect',
      fieldKey,
    });
  }
};

const trySingleCreateAndGet = async ({ refList, input, ref, listKey, fieldKey, context }) => {
  try {
    const [id] = await resolveManyCreates({ refList, context, datasets: [input.create] });
    return id;
  } catch (error) {
    wrapAndThrowSingleError({
      error: error.errors[0].reason,
      message: `Unable to create a new ${ref} as set on ${listKey}.${fieldKey}`,
      path: 'create',
      fieldKey,
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
  ref,
  input,
  context,
  listKey,
  fieldKey,
}) {
  // Multiple items received
  let connectedItems;
  let connectErrors = [];

  let disconnectedItems = [];

  let createdItems;
  let createErrors = [];

  // Convert the ObjectIds to strings
  let valuesToKeep = (currentValue || []).map(value => value.toString());

  if (input.disconnectAll) {
    // We need to feed this through the access control system
    disconnectedItems = await resolveDisconnectItems({
      refList,
      wheres: valuesToKeep.map(id => ({ id })),
      context,
    });
  } else if (input.disconnect) {
    disconnectedItems = await resolveDisconnectItems({
      refList,
      wheres: input.disconnect || [],
      context,
    });
  }

  try {
    connectedItems = await resolveManyUniqueItems({ refList, wheres: input.connect, context });
  } catch (error) {
    connectErrors = error.errors.map(({ reason, index }) =>
      enhanceSingleError({ error: reason, path: ['connect', index], fieldKey })
    );
  }

  try {
    createdItems = await resolveManyCreates({ refList, datasets: input.create, context });
  } catch (error) {
    createErrors = error.errors.map(({ reason, index }) =>
      enhanceSingleError({ error: reason, path: ['create', index], fieldKey })
    );
  }

  if (connectErrors.length || createErrors.length) {
    const error = new Error(
      `Unable to create and/or connect ${createErrors.length +
        connectErrors.length} ${ref} as set on ${listKey}.${fieldKey}`
    );

    error.errors = [...connectErrors, ...createErrors];

    throw error;
  }

  if (disconnectedItems.length) {
    valuesToKeep = valuesToKeep.filter(existingId => !disconnectedItems.includes(existingId));
  }

  return [...valuesToKeep, ...connectedItems, ...createdItems];
}

async function toSingleNestedMutation({
  currentValue,
  refList,
  input,
  ref,
  listKey,
  fieldKey,
  context,
}) {
  let result = currentValue;

  if (currentValue && (input.disconnect || input.disconnectAll)) {
    const where = input.disconnectAll ? { id: currentValue.toString() } : input.disconnect;
    try {
      const itemToDisconnect = await trySingleGet({
        refList,
        wheres: [where],
        ref,
        listKey,
        fieldKey,
        context,
      });
      if (currentValue && currentValue.toString() === itemToDisconnect) {
        // Found the item, so unset it
        result = null;
      }
    } catch (error) {
      // Silently ignore the disconnection (so we don't leak existence of an item)
    }
  }

  if (input.connect) {
    // override result with the connected value
    return await trySingleGet({
      refList,
      wheres: [{ id: input.connect.id }],
      ref,
      listKey,
      fieldKey,
      context,
    });
  }

  if (input.create) {
    // override result with the created value
    return await trySingleCreateAndGet({ refList, input, ref, listKey, fieldKey, context });
  }

  return result;
}

module.exports = async function nestedMutation({
  input,
  currentValue,
  fieldKey,
  listKey,
  many,
  ref,
  refList,
  context,
}) {
  const cleanInput = cleanAndValidateInput({ input, many, listKey, fieldKey, ref });

  const transaction = await openDatabaseTransaction();

  try {
    const result = many
      ? await toManyNestedMutation({
          currentValue,
          refList,
          ref,
          input: cleanInput,
          context,
          listKey,
          fieldKey,
        })
      : await toSingleNestedMutation({
          currentValue,
          refList,
          input: cleanInput,
          ref,
          listKey,
          fieldKey,
          context,
        });
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
