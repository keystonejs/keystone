const getRelatedListAdapterFromQueryPath = (listAdapter, queryPath) => {
  if (!listAdapter) {
    throw new Error('Must provide a list adapter instance');
  }

  let foundListAdapter = listAdapter;

  for (let index = 0; index < queryPath.length; index++) {
    const segment = queryPath[index];
    if (segment === 'AND' || segment === 'OR') {
      // skip over the next item which is an index
      index += 1;
      // And ignore this AND/OR
      continue;
    }

    // Eg; search for which field adapter handles `posts_some`, and return that one
    const fieldAdapter = foundListAdapter.findFieldAdapterForQuerySegment(segment);

    if (!fieldAdapter) {
      // Prettier, you're testing me. Please stop.
      // prettier-ignore
      throw new Error(
          `'${listAdapter.key}' Mongo List Adapter failed to determine field responsible for the`
          + ` query condition '${segment}'. '${segment}' was seen by following the query`
          + ` '${queryPath.slice(0, index + 1).join(' > ')}'.`
        );
    }

    // Then follow the breadcrumbs to find the list adapter
    const currentKey = foundListAdapter.key;
    foundListAdapter = fieldAdapter.getRefListAdapter();

    if (!foundListAdapter) {
      // Seriously, though, Prettier. Don't.
      // prettier-ignore
      throw new Error(
          `'${currentKey}' Mongo List Adapter doesn't have a related list.`
          + ` Are you attempting to do a relationship query on a non-relationship field?`
          + ` '${currentKey}' was found by following the query`
          + ` '${queryPath.slice(0, index + 1).join(' > ')}'.`
        );
    }
  }
  return foundListAdapter;
};

module.exports = { getRelatedListAdapterFromQueryPath };
