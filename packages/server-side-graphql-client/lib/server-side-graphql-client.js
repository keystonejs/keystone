const runQuery = async ({
  keystone,
  query,
  variables,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { data, errors } = await keystone.executeGraphQL({
    context: {
      ...keystone.createContext({ schemaName, authentication: {}, skipAccessControl: true }),
      ...extraContext,
    },
    query,
    variables,
  });
  if (errors) throw errors[0];
  return data;
};

const _runChunkedMutation = async ({
  keystone,
  query,
  gqlName,
  pageSize,
  items,
  schemaName,
  extraContext,
}) => {
  if (pageSize <= 0) pageSize = 1;

  const chunks = items.reduce((accum, item, index) => {
    const chunkIndex = Math.floor(index / pageSize);

    if (!accum[chunkIndex]) {
      accum[chunkIndex] = [];
    }

    accum[chunkIndex].push(item);

    return accum;
  }, []);

  const result = await Promise.all(
    chunks.map(chunk =>
      runQuery({ query, variables: { items: chunk }, keystone, schemaName, extraContext })
    )
  );

  /*
   * The result is of the format: [{createUsers: [{id: '123', name: 'aman'}]}, {createUsers: [{id: '456', name: 'mike'}]}].
   * We need to combine all objects into one array keyed by the `createUsers`, such that, the output is: [{id: '123', name: 'aman'}, {id: '456', name: 'Mike'}]
   */

  return [].concat(...result.map(item => item[gqlName]));
};

const createItem = async ({
  keystone,
  listName,
  item,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { createMutationName, createInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($item: ${createInputName}){
    ${createMutationName}(data: $item) { ${returnFields} }
  }`;

  const result = await runQuery({ keystone, query, variables: { item }, schemaName, extraContext });
  return result[createMutationName];
};

const createItems = async ({
  keystone,
  listName,
  items,
  pageSize = 500,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { createManyMutationName, createManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${createManyInputName}]){
    ${createManyMutationName}(data: $items) { ${returnFields} }
  }`;

  return _runChunkedMutation({
    keystone,
    query,
    items,
    pageSize,
    gqlName: createManyMutationName,
    schemaName,
    extraContext,
  });
};

const getItem = async ({
  keystone,
  listName,
  itemId,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { itemQueryName } = keystone.lists[listName].gqlNames;

  const query = `query ($id: ID!) { ${itemQueryName}(where: { id: $id }) { ${returnFields} }  }`;
  const result = await runQuery({
    keystone,
    query,
    variables: { id: itemId },
    schemaName,
    extraContext,
  });
  return result[itemQueryName];
};

const getItems = async ({
  keystone,
  listName,
  where = {},
  pageSize = 500,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { listQueryName, whereInputName } = keystone.lists[listName].gqlNames;
  const query = `query ($first: Int!, $skip: Int!, $where: ${whereInputName}) { ${listQueryName}(first: $first, skip: $skip, where: $where) { ${returnFields} }  }`;

  let skip = 0;
  let latestResult;
  const allItems = [];

  do {
    const response = await runQuery({
      keystone,
      query,
      schemaName,
      extraContext,
      variables: { first: pageSize, skip, where },
    });

    latestResult = response[Object.keys(response || {})[0]];

    allItems.push(...latestResult);

    skip += pageSize;
  } while (latestResult.length);

  return allItems;
};

const updateItem = async ({
  keystone,
  listName,
  item,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { updateMutationName, updateInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($id: ID!, $data: ${updateInputName}){
    ${updateMutationName}(id: $id, data: $data) { ${returnFields} }
  }`;

  const result = await runQuery({
    keystone,
    query,
    variables: { id: item.id, data: item.data },
    schemaName,
    extraContext,
  });

  return result[updateMutationName];
};

const updateItems = async ({
  keystone,
  listName,
  items,
  pageSize = 500,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { updateManyMutationName, updateManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${updateManyInputName}]){
    ${updateManyMutationName}(data: $items) { ${returnFields} }
  }`;
  return _runChunkedMutation({
    keystone,
    query,
    items,
    pageSize,
    gqlName: updateManyMutationName,
    schemaName,
    extraContext,
  });
};

const deleteItem = async ({
  keystone,
  listName,
  itemId,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { deleteMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($id: ID!){
    ${deleteMutationName}(id: $id) { ${returnFields} }
  }`;

  const result = await runQuery({
    keystone,
    query,
    variables: { id: itemId },
    schemaName,
    extraContext,
  });
  return result[deleteMutationName];
};

const deleteItems = async ({
  keystone,
  listName,
  items,
  pageSize = 500,
  returnFields = `id`,
  schemaName = 'public',
  extraContext = {},
}) => {
  const { deleteManyMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [ID!]){
    ${deleteManyMutationName}(ids: $items) {
      ${returnFields}
    }
  }`;

  return _runChunkedMutation({
    keystone,
    query,
    items,
    pageSize,
    gqlName: deleteManyMutationName,
    extraContext,
    schemaName,
  });
};

module.exports = {
  getItem,
  getItems,
  createItem,
  createItems,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
  runCustomQuery: runQuery,
};
