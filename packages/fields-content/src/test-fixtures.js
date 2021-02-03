// We don't currently have uniqueness tests for Relationship field types
import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';
import { Content } from './index';

const DOC1 =
  '{"object":"document","data":{},"nodes":[{"object":"block","type":"paragraph","data":{},"nodes":[{"object":"text","text":"This is bold","marks":[{"object":"mark","type":"bold","data":{}}]}]}]}';
const DOC2 =
  '{"object":"document","data":{},"nodes":[{"object":"block","type":"paragraph","data":{},"nodes":[{"object":"text","text":"This is BOLD","marks":[{"object":"mark","type":"bold","data":{}}]}]}]}';
const DOC3 =
  '{"object":"document","data":{},"nodes":[{"object":"block","type":"paragraph","data":{},"nodes":[{"object":"text","text":"This is a ","marks":[]},{"object":"inline","type":"link","data":{"href":"www.keystonejs.com"},"nodes":[{"object":"text","text":"link","marks":[]}]},{"object":"text","text":" and a ","marks":[]},{"object":"text","text":"Strikethrough.","marks":[{"object":"mark","type":"strikethrough","data":{}}]},{"object":"text","text":" But this is an ","marks":[]},{"object":"text","text":"underline","marks":[{"object":"mark","type":"underline","data":{}}]},{"object":"text","text":".","marks":[]}]},{"object":"block","type":"blockquote","data":{},"nodes":[{"object":"block","type":"paragraph","data":{},"nodes":[{"object":"text","text":"This is a block quote. ","marks":[]}]}]},{"object":"block","type":"paragraph","data":{},"nodes":[{"object":"text","text":"This is italics.","marks":[{"object":"mark","type":"italic","data":{}}]}]}]}';

// Configurations
export const name = 'Content';
export { Content as type };
export const supportsUnique = false;
export const skipRequiredTest = true;
export const skipCommonFilterTest = true;
export const skipCommonCrudTest = true;

export const getTestFields = () => ({
  name: { type: Text },
  body: { type: Content },
});

export const initItems = () => [
  { name: 'a', body: { create: { document: DOC1 } } },
  { name: 'b', body: { create: { document: DOC2 } } },
  { name: 'c', body: { create: { document: DOC3 } } },
  { name: 'd', body: { create: { document: null } } },
];

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name body { document }',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );
  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );
  test(
    'Filter: document (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document: DOC1 } }, [{ name: 'a', body: { document: DOC1 } }])
    )
  );

  test(
    'Filter: document_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_i: DOC1 } }, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
      ])
    )
  );

  test(
    'Filter: document_not (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not: DOC1 } }, [
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );

  test(
    'Filter: document_not_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_i: DOC1 } }, [
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );

  test(
    'Filter: document_in (case-sensitive, empty list)',
    withKeystone(({ keystone }) => match(keystone, { body: { document_in: [] } }, []))
  );

  test(
    'Filter: document_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_in: [] } }, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );

  test(
    'Filter: document_in',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_in: [DOC1, DOC2] } }, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
      ])
    )
  );

  test(
    'Filter: document_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_in: [DOC1, DOC2] } }, [
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );

  test(
    'Filter: document_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_in: [null] } }, [{ name: 'd', body: { document: null } }])
    )
  );

  test(
    'Filter: document_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_in: [null] } }, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
      ])
    )
  );

  test(
    'Filter: document_contains (case_sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_contains: 'This is bold' } }, [
        { name: 'a', body: { document: DOC1 } },
      ])
    )
  );

  test(
    'Filter: document_contains_i (case_insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_contains_i: 'This is bold' } }, [
        { name: 'a', body: { document: DOC1 } },
        { name: 'b', body: { document: DOC2 } },
      ])
    )
  );

  test(
    'Filter: document_not_contains (case_sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_contains: 'This is bold' } }, [
        { name: 'b', body: { document: DOC2 } },
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );
  test(
    'Filter: document_not_contains_i (case_insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { body: { document_not_contains_i: 'This is bold' } }, [
        { name: 'c', body: { document: DOC3 } },
        { name: 'd', body: { document: null } },
      ])
    )
  );
};

// NOTE: Content field extends Relationship implementation,
// and handles the CRUD operations differently than other field types.
export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        sortBy: 'name_ASC',
        returnFields: 'id body { document }',
      });
      return wrappedFn({ keystone, listKey, items });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, listKey }) => {
        const data = await createItem({
          keystone,
          listKey,
          item: { name: 'bold content', body: { disconnectAll: true, create: { document: DOC1 } } },
          returnFields: 'body { document }',
        });
        expect(data).not.toBe(null);
        expect(data.body.document).toBe(DOC1);
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'body { document }',
        });
        expect(data).not.toBe(null);
        expect(data.body.document).toBe(items[0].body.document);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the document value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { body: { disconnectAll: true, create: { document: DOC2 } } },
            },
            returnFields: 'body { document }',
          });
          expect(data).not.toBe(null);
          expect(data.body.document).toBe(DOC2);
        })
      )
    );

    test(
      'Updating the document value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { body: { disconnectAll: true, create: { document: null } } },
            },
            returnFields: 'body { document }',
          });
          expect(data).not.toBe(null);
          expect(data.body.document).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { name: 'Keystone User Guide' },
            },
            returnFields: 'name body { document }',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('Keystone User Guide');
          expect(data.body.document).toBe(items[0].body.document);
        })
      )
    );
  });
};
