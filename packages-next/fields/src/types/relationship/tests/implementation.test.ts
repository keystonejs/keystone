import { gql } from '@apollo/client';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList } from '@keystone-next/types';
import { Implementation as Field } from '../../../Implementation';
import { Relationship } from '../Implementation';

class MockFieldAdapter {}

class MockListAdapter {
  newFieldAdapter = () => new MockFieldAdapter();
}

const mockFilterFragment = ['first: Int'];

const mockFilterAST = [
  {
    kind: 'InputValueDefinition',
    name: {
      value: 'first',
    },
    type: {
      name: {
        value: 'Int',
      },
    },
  },
];

class MockList {
  key: string;
  adapter: PrismaListAdapter;
  gqlNames: {
    relateToOneInputName: string;
    whereUniqueInputName: string;
    createInputName: string;
    relateToManyInputName: string;
    whereInputName: string;
    outputTypeName: string;
    listQueryName: string;
    itemQueryName: string;
  };
  access: Record<string, any>;
  fieldsByPath: Record<string, Field<any>>;
  // getGraphqlFilterFragment: () => string[];
  listQuery: any;
  listQueryMeta: any;
  itemQuery: any;
  createMutation: any;
  constructor(ref: string) {
    this.key = '';
    this.gqlNames = {
      outputTypeName: ref,
      createInputName: `${ref}CreateInput`,
      whereUniqueInputName: `${ref}WhereUniqueInput`,
      relateToManyInputName: `${ref}RelateToManyInput`,
      relateToOneInputName: `${ref}RelateToOneInput`,
      whereInputName: `${ref}WhereInput`,
      listQueryName: '',
      itemQueryName: '',
    };
    this.access = {
      public: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    };
    this.fieldsByPath = {};
    this.adapter = {} as PrismaListAdapter;
  }
  // The actual implementation in `@keystone-next/keystone-legacy/List/index.js` returns
  // more, but we only want to test that this codepath is called
  getGraphqlFilterFragment = () => mockFilterFragment;
}

function createRelationship({
  path,
  config,
  getListByKey = () => new MockList(config.ref) as BaseKeystoneList,
}: {
  path: string;
  config: { many?: boolean; ref: string; withMeta?: boolean };
  getListByKey?: (key: string) => BaseKeystoneList | undefined;
}) {
  return new Relationship(path, config, {
    getListByKey,
    listKey: 'FakeList',
    listAdapter: new MockListAdapter() as unknown as PrismaListAdapter,
    fieldAdapterClass: MockFieldAdapter as unknown as typeof PrismaFieldAdapter,
    schemaNames: ['public'],
  });
}

describe('Type Generation', () => {
  test('inputs for relationship fields in create args', () => {
    const relMany = createRelationship({
      path: 'foo',
      config: { many: true, ref: 'Zip' },
    });
    expect(relMany.gqlCreateInputFields({ schemaName: 'public' })).toEqual([
      'foo: ZipRelateToManyInput',
    ]);

    const relSingle = createRelationship({
      path: 'foo',
      config: { many: false, ref: 'Zip' },
    });
    expect(relSingle.gqlCreateInputFields({ schemaName: 'public' })).toEqual([
      'foo: ZipRelateToOneInput',
    ]);
  });

  test('inputs for relationship fields in update args', () => {
    const relMany = createRelationship({
      path: 'foo',
      config: { many: true, ref: 'Zip' },
    });
    expect(relMany.gqlUpdateInputFields({ schemaName: 'public' })).toEqual([
      'foo: ZipRelateToManyInput',
    ]);

    const relSingle = createRelationship({
      path: 'foo',
      config: { many: false, ref: 'Zip' },
    });
    expect(relSingle.gqlUpdateInputFields({ schemaName: 'public' })).toEqual([
      'foo: ZipRelateToOneInput',
    ]);
  });

  test('to-single relationship nested mutation input', () => {
    const relationship = createRelationship({
      path: 'foo',
      config: { many: false, ref: 'Zip' },
    });
    const schemaName = 'public';
    // We're testing the AST is as we expect it to be
    expect(gql(relationship.getGqlAuxTypes({ schemaName }).join('\n'))).toMatchObject({
      definitions: [
        {
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
        },
      ],
    });
  });

  test('to-many relationship nested mutation input', () => {
    const relationship = createRelationship({
      path: 'foo',
      config: { many: true, ref: 'Zip' },
    });
    const schemaName = 'public';
    // We're testing the AST is as we expect it to be
    expect(gql(relationship.getGqlAuxTypes({ schemaName }).join('\n'))).toMatchObject({
      definitions: [
        {
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
        },
      ],
    });
  });

  test('to-single relationships cannot be filtered at the field level', () => {
    const path = 'foo';
    const schemaName = 'public';
    const relationship = createRelationship({
      path,
      config: { many: false, ref: 'Zip' },
    });

    // Wrap it in a mock type because all we get back is the fields
    const fieldSchema = `
      type MockType {
        ${relationship.gqlOutputFields({ schemaName }).join('\n')}
      }
    `;

    const fieldAST = gql(fieldSchema);

    expect(fieldAST).toMatchObject({
      definitions: [
        {
          fields: [
            {
              kind: 'FieldDefinition',
              name: {
                value: path,
              },
              arguments: [],
              type: {
                name: {
                  value: 'Zip',
                },
              },
            },
          ],
        },
      ],
    });

    // @ts-ignore
    expect(fieldAST.definitions[0].fields[0].arguments).toHaveLength(0);
  });

  test('to-many relationships can be filtered at the field level', () => {
    const path = 'foo';
    const schemaName = 'public';
    const relationship = createRelationship({
      path,
      config: { many: true, ref: 'Zip' },
    });

    // Wrap it in a mock type because all we get back is the fields
    const fieldSchema = `
      type MockType {
        ${relationship.gqlOutputFields({ schemaName }).join('\n')}
      }
    `;

    const fieldAST = gql(fieldSchema);

    expect(fieldAST).toMatchObject({
      definitions: [
        {
          fields: [
            {
              kind: 'FieldDefinition',
              name: {
                value: 'foo',
              },
              arguments: mockFilterAST,
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'ListType',
                  type: {
                    kind: 'NonNullType',
                    type: {
                      name: {
                        value: 'Zip',
                      },
                    },
                  },
                },
              },
            },
            {
              kind: 'FieldDefinition',
              name: {
                value: `_${path}Meta`,
              },
              // We don't have control over this type, so we just check for
              // existence
              arguments: expect.any(Array),
              type: {
                name: {
                  value: '_QueryMeta',
                },
              },
            },
            {
              kind: 'FieldDefinition',
              name: {
                value: `${path}Count`,
              },
              // We don't have control over this type, so we just check for
              // existence
              arguments: expect.any(Array),
              type: {
                type: {
                  name: {
                    value: 'Int',
                  },
                },
              },
            },
          ],
        },
      ],
    });

    // @ts-ignore
    expect(fieldAST.definitions[0].fields[0].arguments).toHaveLength(1);
  });

  test('to-many relationships can have meta disabled', () => {
    const path = 'foo';
    const schemaName = 'public';
    const relationship = createRelationship({
      path,
      config: { many: true, ref: 'Zip', withMeta: false },
    });

    // Wrap it in a mock type because all we get back is the fields
    const fieldSchema = `
      type MockType {
        ${relationship.gqlOutputFields({ schemaName }).join('\n')}
      }
    `;

    const fieldAST = gql(fieldSchema);

    expect(fieldAST).toMatchObject({
      definitions: [
        {
          fields: [
            {
              kind: 'FieldDefinition',
              name: {
                value: 'foo',
              },
              arguments: mockFilterAST,
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'ListType',
                  type: {
                    kind: 'NonNullType',
                    type: {
                      name: {
                        value: 'Zip',
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    });

    // @ts-ignore
    expect(fieldAST.definitions[0].fields[0].arguments).toHaveLength(1);
  });
});

describe('Referenced list errors', () => {
  const mockList = {
    // ie; "not found"
    getGraphqlFilterFragment: () => [],
    gqlNames: {
      whereInputName: '',
    },
    access: {
      public: {
        create: true,
        read: true,
        update: true,
        delete: true,
        auth: true,
      },
    },
  };

  // Some methods are sync, others async, so we force all to be async so we can
  // have a consistent testing API
  async function asyncify(func: () => any | Promise<any>) {
    return await func();
  }

  (['gqlOutputFields', 'gqlQueryInputFields', 'gqlOutputFieldResolvers'] as const).forEach(
    method => {
      describe(`${method}()`, () => {
        const schemaName = 'public';

        test('throws when list not found', async () => {
          const relMany = createRelationship({
            path: 'foo',
            config: { many: true, ref: 'Zip' },
            // ie; "not found"
            // @ts-ignore
            getListByKey: () => {},
          });
          expect(asyncify(() => relMany[method]({ schemaName }))).rejects.toThrow(
            /Unable to resolve related list 'Zip'/
          );
        });

        test('does not throw when no two way relationship specified', async () => {
          const relMany = createRelationship({
            path: 'foo',
            config: { many: true, ref: 'Zip' },
            // @ts-ignore
            getListByKey: () => mockList,
          });
          return asyncify(() => relMany[method]({ schemaName }));
        });

        test('throws when field on list not found', async () => {
          const relMany = createRelationship({
            path: 'foo',
            config: { many: true, ref: 'Zip.bar' },
            // @ts-ignore
            getListByKey: () => mockList,
          });
          expect(asyncify(() => relMany[method]({ schemaName }))).rejects.toThrow(
            /Unable to resolve two way relationship field 'Zip.bar'/
          );
        });
      });
    }
  );
});
