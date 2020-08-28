import { getItems } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';

import { MongoId } from './index';

export const name = 'MongoId';
export { MongoId as type };
export const exampleValue = '123456781234567812345678';
export const exampleValue2 = '123456781234567812345679';
export const supportsUnique = true;
export const fieldName = 'oldId';

export const getTestFields = () => {
  return {
    name: { type: Text },
    oldId: { type: MongoId },
  };
};

export const initItems = () => {
  return [
    { name: 'a', oldId: '123456781234567812345678' },
    { name: 'b', oldId: '123456781234567812345687' },
    { name: 'c', oldId: '6162636465666768696a6b6c' },
    { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
    { name: 'e', oldId: null },
    { name: 'f' },
  ];
};
export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name oldId',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    `No 'where' argument`,
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
  test(
    `Empty 'where' argument'`,
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
  test(
    `Filter: oldId`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId: '123456781234567812345678' }, [
        { oldId: '123456781234567812345678', name: 'a' },
      ])
    )
  );

  test(
    `Filter: oldId_not`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not: '123456781234567812345678' }, [
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );

  test(
    `Filter: oldId_in (empty list)`,
    withKeystone(({ keystone }) => match(keystone, { oldId_in: [] }, []))
  );

  test(
    `Filter: oldId_in`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_in: ['123456781234567812345687', '123456781234567812345678'] }, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
      ])
    )
  );

  test(
    `Filter: oldId_in null`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_in: [null] }, [
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );

  test(
    `Filter: oldId_not_in null`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not_in: [null] }, [
        { name: 'a', oldId: '123456781234567812345678' },
        { name: 'b', oldId: '123456781234567812345687' },
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
      ])
    )
  );

  test(
    `Filter: oldId_not_in`,
    withKeystone(({ keystone }) =>
      match(keystone, { oldId_not_in: ['123456781234567812345687', '123456781234567812345678'] }, [
        { name: 'c', oldId: '6162636465666768696a6b6c' },
        { name: 'd', oldId: '6d6a6867666c6b73656c6b75' },
        { name: 'e', oldId: null },
        { name: 'f', oldId: null },
      ])
    )
  );
};
