// i think these tests should be covered by things elsewhere but adding @ts-nocheck instead of removing for now
import { createSystem, initConfig } from '@keystone-next/keystone';
import { config, list } from '@keystone-next/keystone/schema';
import { assertInputObjectType, printType, assertObjectType, parse } from 'graphql';
import { relationship } from '..';
import { text } from '../../text';

const fieldKey = 'foo';

const getSchema = (field: any) => {
  return createSystem(
    initConfig(
      config({
        db: { url: 'file:./thing.db', provider: 'sqlite' },
        lists: {
          Zip: list({ fields: { thing: text() } }),
          Test: list({
            fields: {
              [fieldKey]: field,
            },
          }),
        },
      })
    )
  ).graphQLSchema;
};

describe('Type Generation', () => {
  test('inputs for relationship fields in create args', () => {
    const relMany = getSchema(relationship({ many: true, ref: 'Zip' }));
    expect(
      assertInputObjectType(relMany.getType('TestCreateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToManyInput');

    const relSingle = getSchema(relationship({ many: false, ref: 'Zip' }));
    expect(
      assertInputObjectType(relSingle.getType('TestCreateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneInput');
  });

  test('inputs for relationship fields in update args', () => {
    const relMany = getSchema(relationship({ many: true, ref: 'Zip' }));
    expect(
      assertInputObjectType(relMany.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToManyInput');

    const relSingle = getSchema(relationship({ many: false, ref: 'Zip' }));
    expect(
      assertInputObjectType(relSingle.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneInput');
  });

  test('to-single relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: false, ref: 'Zip' }));

    // We're testing the AST is as we expect it to be
    expect(parse(printType(schema.getType('ZipRelateToOneInput')!)).definitions[0]).toMatchObject({
      kind: 'InputObjectTypeDefinition',
      name: {
        value: 'ZipRelateToOneInput',
      },
      fields: [
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'create',
          },
          type: {
            name: {
              value: 'ZipCreateInput',
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'connect',
          },
          type: {
            name: {
              value: 'ZipWhereUniqueInput',
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'disconnect',
          },
          type: {
            name: {
              value: 'ZipWhereUniqueInput',
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'disconnectAll',
          },
          type: {
            name: {
              value: 'Boolean',
            },
          },
        },
      ],
    });
  });

  test('to-many relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: true, ref: 'Zip' }));

    // We're testing the AST is as we expect it to be
    expect(parse(printType(schema.getType('ZipRelateToManyInput')!)).definitions[0]).toMatchObject({
      kind: 'InputObjectTypeDefinition',
      name: {
        value: 'ZipRelateToManyInput',
      },
      fields: [
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'create',
          },
          type: {
            kind: 'ListType',
            type: {
              name: {
                value: 'ZipCreateInput',
              },
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'connect',
          },
          type: {
            kind: 'ListType',
            type: {
              name: {
                value: 'ZipWhereUniqueInput',
              },
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'disconnect',
          },
          type: {
            kind: 'ListType',
            type: {
              name: {
                value: 'ZipWhereUniqueInput',
              },
            },
          },
        },
        {
          kind: 'InputValueDefinition',
          name: {
            value: 'disconnectAll',
          },
          type: {
            name: {
              value: 'Boolean',
            },
          },
        },
      ],
    });
  });

  test('to-single relationships cannot be filtered at the field level', () => {
    const schema = getSchema(relationship({ many: false, ref: 'Zip' }));

    expect(
      (
        parse(printType(assertObjectType(schema.getType('Test')))).definitions[0] as any
      ).fields.find((x: any) => x.name.value === fieldKey)
    ).toMatchObject({
      kind: 'FieldDefinition',
      name: {
        value: fieldKey,
      },
      arguments: [],
      type: {
        name: {
          value: 'Zip',
        },
      },
    });
  });

  test('to-many relationships can be filtered at the field level', () => {
    const schema = getSchema(relationship({ many: true, ref: 'Zip' }));

    expect(printType(schema.getType('Test')!)).toMatchInlineSnapshot(`
      "\\"\\"\\" A keystone list\\"\\"\\"
      type Test {
        id: ID!
        foo(where: ZipWhereInput! = {}, search: String, sortBy: [SortZipsBy!] @deprecated(reason: \\"sortBy has been deprecated in favour of orderBy\\"), orderBy: [ZipOrderByInput!]! = [], first: Int, skip: Int! = 0): [Zip!]
        _fooMeta(where: ZipWhereInput! = {}, search: String, sortBy: [SortZipsBy!] @deprecated(reason: \\"sortBy has been deprecated in favour of orderBy\\"), orderBy: [ZipOrderByInput!]! = [], first: Int, skip: Int! = 0): _QueryMeta @deprecated(reason: \\"This query will be removed in a future version. Please use fooCount instead.\\")
        fooCount(where: ZipWhereInput! = {}): Int
      }"
    `);
  });

  test('to-many relationships can have meta disabled', () => {
    const schema = getSchema(relationship({ many: true, ref: 'Zip', withMeta: false }));

    expect(printType(schema.getType('Test')!)).toMatchInlineSnapshot(`
      "\\"\\"\\" A keystone list\\"\\"\\"
      type Test {
        id: ID!
        foo(where: ZipWhereInput! = {}, search: String, sortBy: [SortZipsBy!] @deprecated(reason: \\"sortBy has been deprecated in favour of orderBy\\"), orderBy: [ZipOrderByInput!]! = [], first: Int, skip: Int! = 0): [Zip!]
      }"
    `);
  });
});

describe('Referenced list errors', () => {
  test('throws when list not found', async () => {
    expect(() => getSchema(relationship({ ref: 'DoesNotExist' }))).toThrow(
      "Unable to resolve related list 'DoesNotExist' from Test.foo"
    );
  });

  test('does not throw when no two way relationship specified', async () => {
    getSchema(relationship({ many: true, ref: 'Zip' }));
  });

  test('throws when field on list not found', async () => {
    expect(() => getSchema(relationship({ many: true, ref: 'Zip.bar' }))).toThrow(
      'The relationship field at Test.foo points to Zip.bar but no field at Zip.bar exists'
    );
  });
});
