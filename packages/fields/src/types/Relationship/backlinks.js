function _queueIdForOperation({ queue, foreign, local, done }) {
  // The queueID encodes the full list/field path and ID of both the foreign and local fields
  const f = info => `${info.list.key}.${info.field.path}.${info.id}`;
  const queueId = `${f(local)}->${f(foreign)}`;

  // It may have already been added elsewhere, so we don't want to add it again
  if (!queue.has(queueId)) {
    queue.set(queueId, { local, foreign: { id: foreign.id }, done });
  }
}

export function enqueueBacklinkOperations(operations, queues, getItem, local, foreign) {
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

export async function resolveBacklinks(context, mutationState) {
  await Promise.all(
    Object.entries(mutationState.queues).map(async ([operation, queue]) => {
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
        const { path, many } = local.field;
        const clause = { [path]: { [operation]: many ? [foreign] : foreign } };
        await local.list.updateMutation(local.id.toString(), clause, context, mutationState);
      }
    })
  );
}
