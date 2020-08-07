import { matchFilter } from '@keystonejs/test-utils';
import Text from '../Text';
import Uuid from './';

const fieldType = 'Uuid';
export { fieldType as name };

export { Uuid as type };
export const exampleValue = '"7b36c9fe-274d-45f1-9f5d-8d4595959734"';
export const exampleValue2 = '"c0d37cbc-2f01-432c-89e0-405d54fd4cdc"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    order: { type: Text },
    otherId: { type: Uuid },
  };
};

export const initItems = () => {
  return [
    { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
    { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
    { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
    { order: 'd', otherId: null },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone/issues/391

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'order otherId',
      expected,
      sortKey: 'order',
    });

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId: "c0d37cbc-2f01-432c-89e0-405d54fd4cdc" }', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );
  test(
    `Filter: {key} (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId: "C0D37CBC-2F01-432C-89E0-405D54FD4CDC" }', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );

  test(
    `Filter: {key}_not`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not: "8452de22-4dfd-4e2a-a6ac-c20ceef0ade4" }', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not: "8452DE22-4DFD-4E2A-A6AC-C20CEEF0ADE4" }', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'd', otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (empty list)`,
    withKeystone(({ keystone }) => match(keystone, 'where: { otherId_in: [] }', []))
  );
  test(
    `Filter: {key}_in`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_in: ["01d20b3c-c0fe-4198-beb6-1a013c041805", "c0d37cbc-2f01-432c-89e0-405d54fd4cdc"] }',
        [
          { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
          { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        ]
      )
    )
  );
  test(
    `Filter: {key}_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_in: ["01D20B3C-C0FE-4198-BEB6-1A013C041805", "C0D37CBC-2F01-432C-89E0-405D54FD4CDC"] }',
        [
          { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
          { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        ]
      )
    )
  );

  test(
    `Filter: {key}_not_in (empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not_in: [] }', [
        { order: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { order: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { order: 'd', otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_not_in: ["01d20b3c-c0fe-4198-beb6-1a013c041805", "c0d37cbc-2f01-432c-89e0-405d54fd4cdc"] }',
        [
          { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { order: 'd', otherId: null },
        ]
      )
    )
  );
  test(
    `Filter: {key}_not_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_not_in: ["01D20B3C-C0FE-4198-BEB6-1A013C041805", "C0D37CBC-2F01-432C-89E0-405D54FD4CDC"] }',
        [
          { order: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { order: 'd', otherId: null },
        ]
      )
    )
  );
};
