import { DocumentNode } from 'graphql';
import { KeystoneContext } from '@keystone-next/types';

const _runChunkedMutation = async ({
  query,
  gqlName,
  pageSize,
  items,
  context,
}: {
  query: string | DocumentNode;
  gqlName: string;
  pageSize: number;
  items: readonly (Record<string, any> | string)[];
  context: KeystoneContext;
}): Promise<Record<string, any>[]> => {
  if (pageSize <= 0) pageSize = 1;

  const chunks = items.reduce((accum: (Record<string, any> | string)[][], item, index) => {
    const chunkIndex = Math.floor(index / pageSize);

    if (!accum[chunkIndex]) {
      accum[chunkIndex] = [];
    }

    accum[chunkIndex].push(item);

    return accum;
  }, []);

  const result: Record<string, Record<string, any>>[] = await Promise.all(
    chunks.map(chunk => context.graphql.run({ query, variables: { items: chunk } }))
  );

  /*
   * The result is of the format: [{createUsers: [{id: '123', name: 'aman'}]}, {createUsers: [{id: '456', name: 'mike'}]}].
   * We need to combine all objects into one array keyed by the `createUsers`, such that, the output is: [{id: '123', name: 'aman'}, {id: '456', name: 'Mike'}]
   */

  return ([] as Record<string, any>).concat(...result.map(item => item[gqlName]));
};

const createItem = async ({
  listKey,
  item,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  item: Record<string, any>;
  returnFields?: string;
  context: KeystoneContext;
}): Promise<Record<string, any>> => {
  const { createMutationName, createInputName } = context.gqlNames(listKey);

  const query = `mutation ($item: ${createInputName}){
    ${createMutationName}(data: $item) { ${returnFields} }
  }`;

  const result = await context.graphql.run({ query, variables: { item } });
  return result[createMutationName];
};

const createItems = async ({
  listKey,
  items,
  pageSize = 500,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  items: readonly { readonly data: Record<string, any> }[];
  pageSize?: number;
  returnFields?: string;
  context: KeystoneContext;
}) => {
  const { createManyMutationName, createInputName } = context.gqlNames(listKey);

  const query = `mutation ($items: [${createInputName}!]!){
    ${createManyMutationName}(data: $items) { ${returnFields} }
  }`;

  return _runChunkedMutation({
    query,
    items,
    pageSize,
    gqlName: createManyMutationName,
    context,
  });
};

const getItem = async ({
  listKey,
  itemId,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  itemId: number | string;
  returnFields?: string;
  context: KeystoneContext;
}): Promise<Record<string, any>> => {
  const { itemQueryName } = context.gqlNames(listKey);

  const query = `query ($id: ID!) { ${itemQueryName}(where: { id: $id }) { ${returnFields} }  }`;
  const result = await context.graphql.run({ query, variables: { id: itemId } });
  return result[itemQueryName];
};

const getItems = async ({
  listKey,
  where = {},
  orderBy,
  first,
  skip,
  pageSize = 500,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  where?: Record<string, any> | null;
  orderBy?: readonly Record<string, any>[] | null;
  first?: number | null;
  skip?: number | null;
  pageSize?: number;
  returnFields?: string;
  context: KeystoneContext;
}): Promise<Record<string, any>[]> => {
  const { listQueryName, whereInputName, listSortName } = context.gqlNames(listKey);

  let query;
  if (orderBy) {
    query = `query ($first: Int!, $skip: Int!, $orderBy: [${listSortName}!], $where: ${whereInputName}) { ${listQueryName}(first: $first, skip: $skip, orderBy: $orderBy, where: $where) { ${returnFields} }  }`;
  } else {
    query = `query ($first: Int!, $skip: Int!, $where: ${whereInputName}) { ${listQueryName}(first: $first, skip: $skip, where: $where) { ${returnFields} }  }`;
  }

  let latestResult;
  let _skip = skip || 0;

  let _first = pageSize;
  const allItems = [];

  do {
    // Making sure we are not over fetching
    if (first && allItems.length + _first > first) {
      _first = first - allItems.length;
    }
    const response = await context.graphql.run({
      query,
      variables: { first: _first, skip: _skip, orderBy, where },
    });

    latestResult = response[Object.keys(response || {})[0]];

    allItems.push(...latestResult);

    _skip += pageSize;
  } while (
    latestResult.length === _first &&
    (first === undefined || first === null || allItems.length < first)
  );

  return allItems;
};

const updateItem = async ({
  listKey,
  item,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  item: Record<string, any>;
  returnFields?: string;
  context: KeystoneContext;
}): Promise<Record<string, any>> => {
  const { updateMutationName, updateInputName } = context.gqlNames(listKey);

  const query = `mutation ($id: ID!, $data: ${updateInputName}!){
    ${updateMutationName}(where: { id: $id }, data: $data) { ${returnFields} }
  }`;

  const result = await context.graphql.run({ query, variables: { id: item.id, data: item.data } });

  return result[updateMutationName];
};

const updateItems = async ({
  listKey,
  items,
  pageSize = 500,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  items: readonly { where: { readonly id: string }; readonly data: Record<string, any> }[];
  pageSize?: number;
  returnFields?: string;
  context: KeystoneContext;
}) => {
  const { updateManyMutationName, updateManyInputName } = context.gqlNames(listKey);

  const query = `mutation ($items: [${updateManyInputName}!]!){
    ${updateManyMutationName}(data: $items) { ${returnFields} }
  }`;
  return _runChunkedMutation({
    query,
    items,
    pageSize,
    gqlName: updateManyMutationName,
    context,
  });
};

const deleteItem = async ({
  listKey,
  itemId,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  itemId: number | string;
  returnFields?: string;
  context: KeystoneContext;
}): Promise<Record<string, any> | null> => {
  const { deleteMutationName } = context.gqlNames(listKey);

  const query = `mutation ($id: ID!){
    ${deleteMutationName}(id: $id) { ${returnFields} }
  }`;

  const result = await context.graphql.run({ query, variables: { id: itemId } });
  return result[deleteMutationName];
};

const deleteItems = async ({
  listKey,
  items,
  pageSize = 500,
  returnFields = `id`,
  context,
}: {
  listKey: string;
  pageSize?: number;
  returnFields?: string;
  items: readonly string[];
  context: KeystoneContext;
}) => {
  const { deleteManyMutationName } = context.gqlNames(listKey);

  const query = `mutation ($items: [ID!]!){
    ${deleteManyMutationName}(ids: $items) {
      ${returnFields}
    }
  }`;

  return _runChunkedMutation({
    query,
    items,
    pageSize,
    gqlName: deleteManyMutationName,
    context,
  });
};

export {
  getItem,
  getItems,
  createItem,
  createItems,
  updateItem,
  updateItems,
  deleteItem,
  deleteItems,
};
