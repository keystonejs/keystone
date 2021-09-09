import { assertInputObjectType, printType, assertObjectType, parse } from 'graphql';
import { createSystem, initConfig } from '../../../../system';
import { config, list } from '../../../..';
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
    ).toEqual('ZipRelateToManyForCreateInput');

    const relSingle = getSchema(relationship({ many: false, ref: 'Zip' }));
    expect(
      assertInputObjectType(relSingle.getType('TestCreateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneForCreateInput');
  });

  test('inputs for relationship fields in update args', () => {
    const relMany = getSchema(relationship({ many: true, ref: 'Zip' }));
    expect(
      assertInputObjectType(relMany.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToManyForUpdateInput');

    const relSingle = getSchema(relationship({ many: false, ref: 'Zip' }));
    expect(
      assertInputObjectType(relSingle.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneForUpdateInput');
  });

  test('to-one for create relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: false, ref: 'Zip' }));

    expect(printType(schema.getType('ZipRelateToOneForCreateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToOneForCreateInput {
  create: ZipCreateInput
  connect: ZipWhereUniqueInput
}"
`);
  });

  test('to-one for update relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: false, ref: 'Zip' }));

    expect(printType(schema.getType('ZipRelateToOneForUpdateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToOneForUpdateInput {
  create: ZipCreateInput
  connect: ZipWhereUniqueInput
  disconnect: Boolean
}"
`);
  });

  test('to-many for create relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: true, ref: 'Zip' }));

    expect(printType(schema.getType('ZipRelateToManyForCreateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToManyForCreateInput {
  create: [ZipCreateInput!]
  connect: [ZipWhereUniqueInput!]
}"
`);
  });

  test('to-many for update relationship nested mutation input', () => {
    const schema = getSchema(relationship({ many: true, ref: 'Zip' }));

    expect(printType(schema.getType('ZipRelateToManyForUpdateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToManyForUpdateInput {
  disconnect: [ZipWhereUniqueInput!]
  set: [ZipWhereUniqueInput!]
  create: [ZipCreateInput!]
  connect: [ZipWhereUniqueInput!]
}"
`);
  });

  test('to-one relationships cannot be filtered at the field level', () => {
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
"type Test {
  id: ID!
  foo(where: ZipWhereInput! = {}, orderBy: [ZipOrderByInput!]! = [], take: Int, skip: Int! = 0): [Zip!]
  fooCount(where: ZipWhereInput! = {}): Int
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
