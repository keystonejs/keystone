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

const runPaginatedQuery = async ({ pageSize = 1, variables = {}, verbose = false, ...rest }) => {
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
      variables: { ...variables, first: pageSize, skip },
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

const runChunkedMutation = async ({ pageSize = 500, items, ...rest }) => {
  const chunks = chunkArray(items, pageSize);

  const result = await Promise.all(
    chunks.map(async chunk => {
      return await runQuery({ ...rest, variables: { items: chunk } });
    })
  );

  return result;
};

const createItem = ({ keystone, listName, item, returnFields = `id`, ...rest }) => {
  const { createMutationName, createInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($item: ${createInputName}){
    ${createMutationName}(data: $item) { ${returnFields} }
  }`;

  return runQuery({ keystone, query, variables: { item }, ...rest });
};

const createItems = ({ keystone, listName, items, returnFields = `id`, ...rest }) => {
  const { createManyMutationName, createManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${createManyInputName}]){
    ${createManyMutationName}(data: $items) { ${returnFields} }
  }`;

  return runChunkedMutation({ keystone, query, items, ...rest });
};

const getItem = ({ keystone, listName, returnFields, item: id, ...args }) => {
  const { itemQueryName } = keystone.lists[listName].gqlNames;
  const query = `query ($id: ID!) { ${itemQueryName}(where: { id: $id }) { ${returnFields} }  }`;
  return runQuery({ keystone, query, variables: { id }, ...args });
};

const getAllItems = ({ keystone, listName, returnFields, ...args }) => {
  const { listQueryName } = keystone.lists[listName].gqlNames;
  const query = `query ($first: Int!, $skip: Int!) { ${listQueryName}(first: $first, skip: $skip) { ${returnFields} }  }`;
  return runPaginatedQuery({ keystone, query, pageSize: 500, ...args });
};

const updateItem = ({ keystone, listName, item, returnFields = `id`, ...rest }) => {
  const { updateMutationName, updateInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($id: ID!, $data: ${updateInputName}){
    ${updateMutationName}(id: $id, data: $data) { ${returnFields} }
  }`;

  return runQuery({ keystone, query, variables: { id: item.id, data: item.data }, ...rest });
};

const updateItems = ({ keystone, listName, items, returnFields = `id`, ...rest }) => {
  const { updateManyMutationName, updateManyInputName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [${updateManyInputName}]){
    ${updateManyMutationName}(data: $items) { ${returnFields} }
  }`;

  return runChunkedMutation({ keystone, query, items, ...rest });
};

const deleteItem = ({ keystone, listName, item, returnFields = `id`, ...rest }) => {
  const { deleteMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($item: ID!){
    ${deleteMutationName}(id: $item) { ${returnFields} }
  }`;

  return runQuery({ keystone, query, variables: { item }, ...rest });
};

const deleteItems = ({ keystone, listName, items, returnFields = `id`, ...rest }) => {
  const { deleteManyMutationName } = keystone.lists[listName].gqlNames;

  const query = `mutation ($items: [ID!]){
    ${deleteManyMutationName}(ids: $items) {
      ${returnFields}
    }
  }`;

  return runChunkedMutation({ keystone, query, items, ...rest });
};

module.exports = {
  runQuery,
  runPaginatedQuery,
  runChunkedMutation,
  getItem,
  getAllItems,
  createItems,
  createItem,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
};
