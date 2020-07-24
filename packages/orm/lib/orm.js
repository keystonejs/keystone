const chunkArray = (array, chunkSize) => {
  if (chunkSize <= 0) chunkSize = 1;

  return array.reduce((accum, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!accum[chunkIndex]) {
      accum[chunkIndex] = [];
    }

    accum[chunkIndex].push(item);

    return accum;
  }, []);
};

const runQuery = async ({
  query,
  variables,
  keystone,
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

const runPaginatedQuery = async ({
  pageSize = 1,
  variables = {},
  verbose = false,
  where = {},
  ...rest
}) => {
  let skip = 0;
  let latestResult;
  const allItems = [];

  if (verbose) {
    console.log(`Started paginated query`);
    console.log({ pageSize });
  }

  do {
    if (verbose) console.log({ skip });

    const response = await runQuery({
      ...rest,
      variables: { ...variables, first: pageSize, skip, where },
    });

    latestResult = response[Object.keys(response || {})[0]];

    allItems.push(...latestResult);

    skip += pageSize;
  } while (latestResult.length);

  if (verbose) {
    console.log(`Finished paginated query`);
    console.log(`${allItems.length} items found`);
  }

  return allItems;
};

const runChunkedMutation = async ({ gqlName, pageSize = 500, items, ...rest }) => {
  const chunks = chunkArray(items, pageSize);

  const result = await Promise.all(
    chunks.map(chunk => runQuery({ ...rest, variables: { items: chunk } }))
  );

  /*
   * The result is of the format: [{createUsers: [{id: '123', name: 'aman'}]}, {createUsers: [{id: '456', name: 'mike'}]}].
   * We need to combine all objects into one array keyed by the `createUsers`, such that, the output is: {createUsers: [{id: '123', name: 'aman'}, {id: '456', name: 'Mike'}]}
   */

  return { [gqlName]: [].concat(...result.map(item => item[gqlName])) };
};

const createItem = ({
  keystone,
  listName,
  item,
  returnFields = `id`,
  schemaName,
  extraContext,
}) => {
  const { createMutationName, createInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($item: ${createInputName}){
    ${createMutationName}(data: $item) { ${returnFields} }
  }`;

  return runQuery({ keystone, query, variables: { item }, schemaName, extraContext });
};

const createItems = ({
  keystone,
  listName,
  items,
  returnFields = `id`,
  schemaName,
  extraContext,
}) => {
  const { createManyMutationName, createManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${createManyInputName}]){
    ${createManyMutationName}(data: $items) { ${returnFields} }
  }`;

  return runChunkedMutation({
    keystone,
    query,
    items,
    gqlName: createManyMutationName,
    schemaName,
    extraContext,
  });
};

const getItemById = ({
  keystone,
  listName,
  returnFields = `id`,
  itemId: id,
  schemaName,
  extraContext,
}) => {
  const { itemQueryName } = keystone.lists[listName].gqlNames;
  const query = `query ($id: ID!) { ${itemQueryName}(where: { id: $id }) { ${returnFields} }  }`;
  return runQuery({ keystone, query, variables: { id }, schemaName, extraContext });
};

const getItems = ({ keystone, listName, returnFields = `id`, schemaName, extraContext, where }) => {
  const { listQueryName, whereInputName } = keystone.lists[listName].gqlNames;
  const query = `query ($first: Int!, $skip: Int!, $where: ${whereInputName}) { ${listQueryName}(first: $first, skip: $skip, where: $where) { ${returnFields} }  }`;
  return runPaginatedQuery({ keystone, query, pageSize: 500, schemaName, extraContext, where });
};

const updateItem = ({
  keystone,
  listName,
  item,
  returnFields = `id`,
  schemaName,
  extraContext,
}) => {
  const { updateMutationName, updateInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($id: ID!, $data: ${updateInputName}){
    ${updateMutationName}(id: $id, data: $data) { ${returnFields} }
  }`;

  return runQuery({
    keystone,
    query,
    variables: { id: item.id, data: item.data },
    schemaName,
    extraContext,
  });
};

const updateItems = ({
  keystone,
  listName,
  items,
  returnFields = `id`,
  schemaName,
  extraContext,
}) => {
  const { updateManyMutationName, updateManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${updateManyInputName}]){
    ${updateManyMutationName}(data: $items) { ${returnFields} }
  }`;
  return runChunkedMutation({
    keystone,
    query,
    items,
    gqlName: updateManyMutationName,
    schemaName,
    extraContext,
  });
};

const deleteItem = ({
  keystone,
  listName,
  item,
  returnFields = `id`,
  schemaName,
  extraContext,
}) => {
  const { deleteMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($item: ID!){
    ${deleteMutationName}(id: $item) { ${returnFields} }
  }`;

  return runQuery({ keystone, query, variables: { item }, schemaName, extraContext });
};

const deleteItems = ({ keystone, listName, items, returnFields = `id`, ...rest }) => {
  const { deleteManyMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [ID!]){
    ${deleteManyMutationName}(ids: $items) {
      ${returnFields}
    }
  }`;

  return runChunkedMutation({ keystone, query, items, gqlName: deleteManyMutationName, ...rest });
};

module.exports = {
  runQuery,
  getItemById,
  getItems,
  createItems,
  createItem,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
};
