const groupBy = require('lodash.groupby');
const pSettle = require('p-settle');
const { intersection, pick } = require('@voussoir/utils');
const { ParameterError } = require('./graphqlErrors');

const NESTED_MUTATIONS = ['create', 'connect', 'disconnect', 'disconnectAll'];

/***  Queue operations ***/
function _queueIdForOperation({ queue, foreign, local, done }) {
  // The queueID encodes the full list/field path and ID of both the foreign and local fields
  const f = info => `${info.list.key}.${info.field.path}.${info.id}`;
  const queueId = `${f(local)}->${f(foreign)}`;

  // It may have already been added elsewhere, so we don't want to add it again
  if (!queue.has(queueId)) {
    queue.set(queueId, { local, foreign: { id: foreign.id }, done });
  }
}

function enqueueBacklinkOperations(operations, queues, getItem, local, foreign) {
  Object.entries(operations).forEach(([operation, idsToOperateOn = []]) => {
    queues[operation] = queues[operation] || new Map();
    const queue = queues[operation];
    // NOTE: We don't return this promises, we expect it to be fulfilled at a
    // future date and don't want to wait for it now.
    getItem.then(item => {
      const _local = { ...local, id: item.id };
      idsToOperateOn.forEach(id => {
        const _foreign = { ...foreign, id };
        // Enqueue the backlink operation (foreign -> local)
        _queueIdForOperation({ queue, foreign: _local, local: _foreign, done: false });

        // Effectively dequeue the forward link operation (local -> foreign)
        // To avoid any circular updates with the above disconnect, we flag this
        // item as having already been connected/disconnected
        _queueIdForOperation({ queue, foreign: _foreign, local: _local, done: true });
      });
    });
  });
}

async function resolveBacklinks(queues = {}, context) {
  await Promise.all(
    Object.entries(queues).map(async ([operation, queue]) => {
      for (let queuedWork of queue.values()) {
        if (queuedWork.done) {
          continue;
        }
        // Flag it as handled so we don't try again in a nested update
        // NOTE: We do this first before any other work below to avoid async issues
        // To avoid issues with looping and Map()s, we directly set the value on the
        // object as stored in the Map, and don't try to update the Map() itself.
        queuedWork.done = true;

        // Run update of local.path <operation>>> foreign.id
        // NOTE: This relies on the user having `update` permissions on the local list.
        const { local, foreign } = queuedWork;
        const { path, config } = local.field;
        const clause = { [path]: { [operation]: config.many ? [foreign] : foreign } };
        await local.list.updateMutation(local.id, clause, context);
      }
    })
  );
}

/*** Input validation  ***/
const throwWithErrors = ({ message, errors }) => {
  const error = new Error(message);
  error.errors = errors;
  throw error;
};

function validateInput({ input, target, many }) {
  // Only accept mutations which we know how to handle.
  let validInputMutations = intersection(Object.keys(input), NESTED_MUTATIONS);

  // Filter out mutations which don't have any parameters
  if (many) {
    // to-many must have an array of at least one item with at least one key
    validInputMutations = validInputMutations.filter(
      mutation =>
        mutation === 'disconnectAll' ||
        (Array.isArray(input[mutation]) &&
          input[mutation].filter(item => Object.keys(item).length).length)
    );
  } else {
    validInputMutations = validInputMutations.filter(
      mutation => mutation === 'disconnectAll' || Object.keys(input[mutation]).length
    );
  }

  // We must have at least one valid mutation
  if (!validInputMutations.length) {
    throw new ParameterError({
      message: `Must provide a nested mutation (${NESTED_MUTATIONS.join(
        ', '
      )}) when mutating ${target}`,
    });
  }

  // For a non-many relationship we can't create AND connect - only one can be set at a time
  if (!many && validInputMutations.includes('create') && validInputMutations.includes('connect')) {
    throw new ParameterError({
      message: `Can only provide one of 'connect' or 'create' when mutating ${target}`,
    });
  }
  return validInputMutations;
}

const cleanAndValidateInput = ({ input, many, localField, target }) => {
  try {
    return pick(input, validateInput({ input, target, many }));
  } catch (error) {
    const message = `Nested mutation operation invalid for ${target}`;
    throwWithErrors({ message, errors: [{ ...error, path: [localField.path] }] });
  }
};

const _runActions = async (action, targets, path) => {
  const results = await pSettle((targets || []).map(action));
  const errors = results
    .map((settleInfo, index) => ({ ...settleInfo, index }))
    .filter(({ isRejected }) => isRejected)
    .map(({ reason, index }) => ({ ...reason, path: [...path, index] }));
  // If there are no errors we know everything resolved successfully
  return [errors.length ? [] : results.map(({ value }) => value), errors];
};

const openDatabaseTransaction = () => {
  // TODO: Implement transactions
  return {
    rollback: () => {},
    commit: () => {},
  };
};

async function toManyNestedMutation({
  input,
  currentValue,
  refList,
  refField,
  context,
  localField,
  queueData,
  target,
}) {
  // Convert the ObjectIds to strings
  const idsToKeep = (currentValue || []).map(id => id.toString());

  let disconnectIds = [];
  if (input.disconnectAll) {
    disconnectIds = [...idsToKeep];
  } else if (input.disconnect) {
    // We want to avoid DB lookups where possible, so we split the input into
    // two halves; one with ids, and the other without ids
    const { withId, withoutId } = groupBy(input.disconnect, ({ id }) =>
      id ? 'withId' : 'withoutId'
    );

    // We set the Ids we do find immediately
    disconnectIds = (withId || []).map(({ id }) => id);

    // And any without ids (ie; other unique criteria), have to be looked up
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    const action = where => refList.itemQuery(where.id, context, refList.gqlNames.itemQueryName);
    // We don't throw if any fail; we're only interested in the ones this user has
    // access to read (and hence remove from the list)
    const disconnectItems = (await pSettle((withoutId || []).map(action)))
      .filter(({ isFulfilled }) => isFulfilled)
      .map(({ value }) => value)
      .filter(itemToDisconnect => itemToDisconnect); // Possible to get null results when the id doesn't exist, or read access is denied

    disconnectIds.push(...disconnectItems.map(({ id }) => id));
  }

  if (refField) {
    const { queues, getItem, local, foreign } = queueData;
    enqueueBacklinkOperations({ disconnect: disconnectIds }, queues, getItem, local, foreign);
  }

  let allConnectedIds = [];
  if (input.connect || input.create) {
    // This will resolve access control, etc for us.
    // In the future, when WhereUniqueInput accepts more than just an id,
    // this will also resolve those queries for us too.
    const [connectedItems, connectErrors] = await _runActions(
      where => refList.itemQuery(where.id, context, refList.gqlNames.itemQueryName),
      input.connect,
      [localField.path, 'connect']
    );

    // Create related item. Will check for access control itself, no need to do anything extra here.
    // NOTE: We don't check for read access control on the returned ids as the
    // user will not have seen it, so it's ok to return it directly here.
    const [createdItems, createErrors] = await _runActions(
      data => refList.createMutation(data, context),
      input.create,
      [localField.path, 'create']
    );

    // Combine and map the data in the format we actually need
    // Created items now get connected too, so they're coming along for the ride!
    allConnectedIds = [...connectedItems, ...createdItems]
      // Possible to get null results when the id doesn't exist, or read access is denied
      .filter(itemConnected => itemConnected)
      .map(({ id }) => id);

    if (refField) {
      // At this point, we've not actually added the ID `idToConnect` to the
      // field `localField` on list `localList`, just flagged it needing to be added.
      // This is so any recursive checks don't attempt to do it again.
      const { queues, getItem, local, foreign } = queueData;
      enqueueBacklinkOperations({ connect: allConnectedIds }, queues, getItem, local, foreign);
    }

    const allErrors = [...connectErrors, ...createErrors];
    if (allErrors.length) {
      const message = `Unable to create and/or connect ${allErrors.length} ${target}`;
      throwWithErrors({ message, errors: allErrors });
    }
  }

  // When there are items to disconnect, we want to remove them from the 'to-keep array'
  return [...idsToKeep.filter(id => !disconnectIds.includes(id)), ...allConnectedIds];
}

async function toSingleNestedMutation({
  input,
  currentValue,
  localField,
  refList,
  refField,
  context,
  queueData,
  target,
}) {
  let result = currentValue;

  if ((input.disconnect || input.disconnectAll) && currentValue) {
    let idToDisconnect;
    if (input.disconnectAll) {
      idToDisconnect = currentValue.toString();
    } else if (input.disconnect.id) {
      idToDisconnect = input.disconnect.id;
    } else {
      try {
        // Support other unique fields for disconnection
        const itemToDisconnect = await refList.itemQuery(
          input.disconnect,
          context,
          refList.gqlNames.itemQueryName
        );
        idToDisconnect = itemToDisconnect.id.toString();
      } catch (error) {
        // Maybe we don't have read access, or maybe the item doesn't exist
        // (recently deleted, or it's an erroneous value in the relationship field)
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
        const { queues, getItem, local, foreign } = queueData;
        const disconnect = [idToDisconnect];
        enqueueBacklinkOperations({ disconnect }, queues, getItem, local, foreign);
      }
    }
  }

  if (input.connect || input.create) {
    // override result with the connected/created value
    // input is of type *RelateToOneInput
    let item;
    try {
      item = await (input.connect
        ? refList.itemQuery(input.connect.id, context, refList.gqlNames.itemQueryName)
        : refList.createMutation(input.create, context));
    } catch (error) {
      const operation = input.connect ? 'connect' : 'create';
      const message = `Unable to ${operation} a ${target}`;
      throwWithErrors({ message, errors: [{ ...error, path: [localField.path, operation] }] });
    }
    // Can happen when the input id doesn't exist / the user doesn't have read access
    if (!item) {
      return undefined;
    }

    if (refField) {
      // At this point, we've not actually added the ID `item.id` to the
      // field `localField` on list `localList`, just flagged it needing to be added.
      // This is so any recursive checks don't attempt to do it again.
      const { queues, getItem, local, foreign } = queueData;
      enqueueBacklinkOperations({ connect: [item.id] }, queues, getItem, local, foreign);
    }

    return item.id;
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
  const target = `${localList.key}.${localField.path}<${refList.key}>`;
  const cleanInput = cleanAndValidateInput({ input, many, localList, localField, refList, target });

  const transaction = await openDatabaseTransaction();

  try {
    const queueData = {
      queues: context.queues,
      getItem,
      local: { list: localList, field: localField },
      foreign: { list: refList, field: refField },
    };
    const args = {
      currentValue,
      refList,
      refField,
      input: cleanInput,
      context,
      localField,
      queueData,
      target,
    };
    const result = await (many ? toManyNestedMutation(args) : toSingleNestedMutation(args));
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  nestedMutation,
  resolveBacklinks,
  enqueueBacklinkOperations,
};
