import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Uuid from './';

export const name = 'Uuid';
export const type = Uuid;
export const exampleValue = () => '7b36c9fe-274d-45f1-9f5d-8d4595959734';
export const exampleValue2 = () => 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc';
export const supportsUnique = true;
export const fieldName = 'otherId';

export const getTestFields = () => ({ name: { type: Text }, otherId: { type } });

export const initItems = () => {
  return [
    { name: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
    { name: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
    { name: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
    { name: 'd', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041806' },
    { name: 'e', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
    { name: 'f', otherId: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
  { name: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
  { name: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
  { name: 'd', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041806' },
  { name: 'e', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
  { name: 'f', otherId: null },
  { name: 'g', otherId: null },
];

export const supportedFilters = () => ['null_equality', 'equality', 'in_empty_null', 'in_value'];

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name otherId',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    `Filter: {key} (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId: 'C0D37CBC-2F01-432C-89E0-405D54FD4CDC' }, [
        { name: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
      ])
    )
  );

  test(
    `Filter: {key}_not (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(keystone, { otherId_not: '8452DE22-4DFD-4E2A-A6AC-C20CEEF0ADE4' }, [
        { name: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
        { name: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        { name: 'd', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041806' },
        { name: 'f', otherId: null },
        { name: 'g', otherId: null },
      ])
    )
  );

  test(
    `Filter: {key}_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_in: [
            '01D20B3C-C0FE-4198-BEB6-1A013C041805',
            'C0D37CBC-2F01-432C-89E0-405D54FD4CDC',
          ],
        },
        [
          { name: 'a', otherId: 'c0d37cbc-2f01-432c-89e0-405d54fd4cdc' },
          { name: 'b', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041805' },
        ]
      )
    )
  );

  test(
    `Filter: {key}_not_in (implicit case-insensitivity)`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          otherId_not_in: [
            '01D20B3C-C0FE-4198-BEB6-1A013C041805',
            'C0D37CBC-2F01-432C-89E0-405D54FD4CDC',
          ],
        },
        [
          { name: 'c', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { name: 'd', otherId: '01d20b3c-c0fe-4198-beb6-1a013c041806' },
          { name: 'e', otherId: '8452de22-4dfd-4e2a-a6ac-c20ceef0ade4' },
          { name: 'f', otherId: null },
          { name: 'g', otherId: null },
        ]
      )
    )
  );
};
