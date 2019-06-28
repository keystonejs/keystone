import { matchFilter } from '@keystone-alpha/test-utils';
import Uuid from './';

const fieldType = 'Uuid';
export { fieldType as name };

export { Uuid as type };
export const exampleValue = '"7b36c9fe-274d-45f1-9f5d-8d4595959734"';

export const getTestFields = () => {
  return {
    otherId: { type: Uuid },
  };
};

export const initItems = () => {
  return [
    { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
    { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
    { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
    { otherId: null },
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone-5/issues/391

export const filterTests = withKeystone => {
  const match = (keystone, gqlArgs, targets) => {
    return matchFilter(keystone, gqlArgs, '{ otherId }', targets, 'otherId');
  };

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { otherId: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, '', [
        { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId: "c0d37cbc-2f01-432c-89e0-405d54fd4cdc" }', [
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );
  test(
    `Filter: {key} (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId: "C0D37CBC-2F01-432C-89E0-405D54FD4CDC" }', [
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );

  test(
    `Filter: {key}_not`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not: "8452de22-4dfd-4e2a-a6ac-c20ceef0ade4" }', [
        { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not: "8452DE22-4DFD-4E2A-A6AC-C20CEEF0ADE4" }', [
        { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { otherId: null },
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
          { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
          { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
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
          { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
          { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        ]
      )
    )
  );

  test(
    `Filter: {key}_not_in (empty list)`,
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { otherId_not_in: [] }', [
        { otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
        { otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { otherId: null },
      ])
    )
  );
  test(
    `Filter: {key}_not_in`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_not_in: ["01d20b3c-c0fe-4198-beb6-1a013c041805", "c0d37cbc-2f01-432c-89e0-405d54fd4cdc"] }',
        [{ otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' }, { otherId: null }]
      )
    )
  );
  test(
    `Filter: {key}_not_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { otherId_not_in: ["01D20B3C-C0FE-4198-BEB6-1A013C041805", "C0D37CBC-2F01-432C-89E0-405D54FD4CDC"] }',
        [{ otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' }, { otherId: null }]
      )
    )
  );
};
