import { assertInputObjectType, printType, assertObjectType, parse } from 'graphql'
import { type KeystoneConfig } from '@keystone-6/core/types'

import { config, list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { createSystem } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'

const fieldKey = 'foo'

function getSchema (field: {
  ref: string
  many?: boolean
}) {
  return createSystem(
    config({
      db: { url: 'file:./thing.db', provider: 'sqlite' },
      lists: {
        Zip: list({ fields: { thing: text() }, access: allowAll }),
        Test: list({
          access: allowAll,
          fields: {
            [fieldKey]: relationship(field),
          },
        }),
      },
    })
  ).graphQLSchema
}

describe('Type Generation', () => {
  test('inputs for relationship fields in create args', () => {
    const relMany = getSchema({ many: true, ref: 'Zip' })
    expect(
      assertInputObjectType(relMany.getType('TestCreateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToManyForCreateInput')

    const relSingle = getSchema({ many: false, ref: 'Zip' })
    expect(
      assertInputObjectType(relSingle.getType('TestCreateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneForCreateInput')
  })

  test('inputs for relationship fields in update args', () => {
    const relMany = getSchema({ many: true, ref: 'Zip' })
    expect(
      assertInputObjectType(relMany.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToManyForUpdateInput')

    const relSingle = getSchema({ many: false, ref: 'Zip' })
    expect(
      assertInputObjectType(relSingle.getType('TestUpdateInput')).getFields().foo.type.toString()
    ).toEqual('ZipRelateToOneForUpdateInput')
  })

  test('to-one for create relationship nested mutation input', () => {
    const schema = getSchema({ many: false, ref: 'Zip' })

    expect(printType(schema.getType('ZipRelateToOneForCreateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToOneForCreateInput {
  create: ZipCreateInput
  connect: ZipWhereUniqueInput
}"
`)
  })

  test('to-one for update relationship nested mutation input', () => {
    const schema = getSchema({ many: false, ref: 'Zip' })

    expect(printType(schema.getType('ZipRelateToOneForUpdateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToOneForUpdateInput {
  create: ZipCreateInput
  connect: ZipWhereUniqueInput
  disconnect: Boolean
}"
`)
  })

  test('to-many for create relationship nested mutation input', () => {
    const schema = getSchema({ many: true, ref: 'Zip' })

    expect(printType(schema.getType('ZipRelateToManyForCreateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToManyForCreateInput {
  create: [ZipCreateInput!]
  connect: [ZipWhereUniqueInput!]
}"
`)
  })

  test('to-many for update relationship nested mutation input', () => {
    const schema = getSchema({ many: true, ref: 'Zip' })

    expect(printType(schema.getType('ZipRelateToManyForUpdateInput')!)).toMatchInlineSnapshot(`
"input ZipRelateToManyForUpdateInput {
  disconnect: [ZipWhereUniqueInput!]
  set: [ZipWhereUniqueInput!]
  create: [ZipCreateInput!]
  connect: [ZipWhereUniqueInput!]
}"
`)
  })

  test('to-one relationships cannot be filtered at the field level', () => {
    const schema = getSchema({ many: false, ref: 'Zip' })

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
    })
  })

  test('to-many relationships can be filtered at the field level', () => {
    const schema = getSchema({ many: true, ref: 'Zip' })

    expect(printType(schema.getType('Test')!)).toMatchInlineSnapshot(`
"type Test {
  id: ID!
  foo(where: ZipWhereInput! = {}, orderBy: [ZipOrderByInput!]! = [], take: Int, skip: Int! = 0, cursor: ZipWhereUniqueInput): [Zip!]
  fooCount(where: ZipWhereInput! = {}): Int
}"
`)
  })
})

describe('Reference errors', () => {
  function tryf (lists: KeystoneConfig['lists']) {
    return createSystem(
      config({
        db: { url: 'file:./thing.db', provider: 'sqlite' },
        lists,
      })
    ).graphQLSchema
  }

  const fixtures = {
    'list not found': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc.def' })
          }
        }),
      },
      error: `Foo.bar points to Abc.def, but Abc.def doesn't exist`,
    },
    'field not found': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc.def' }),
          },
        }),
        Abc: list({
          access: allowAll,
          fields: {},
        }),
      },
      error: `Foo.bar points to Abc.def, but Abc.def doesn't exist`,
    },
    '1-way / 2-way conflict': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc.def' }),
          },
        }),
        Abc: list({
          access: allowAll,
          fields: {
            def: relationship({ ref: 'Foo' }),
          },
        }),
      },
      error: `Foo.bar expects Abc.def to be a two way relationship, but Abc.def points to Foo`,
    },
    '3-way / 2-way conflict': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc.def' }),
          },
        }),
        Abc: list({
          access: allowAll,
          fields: {
            def: relationship({ ref: 'Foo.bazzz' }),
          },
        }),
      },
      error: `Foo.bar expects Abc.def to be a two way relationship, but Abc.def points to Foo.bazzz`,
    },
    'field wrong type': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc.def' }),
          },
        }),
        Abc: list({
          access: allowAll,
          fields: {
            def: text(),
          },
        }),
      },
      error: `Foo.bar points to Abc.def, but Abc.def is not a relationship field`,
    },
    '1-way relationships': {
      lists: {
        Foo: list({
          access: allowAll,
          fields: {
            bar: relationship({ ref: 'Abc' }),
          },
        }),
        Abc: list({
          access: allowAll,
          fields: {},
        }),
      },
      error: null,
    },
  }

  for (const [description, { lists, error }] of Object.entries(fixtures)) {
    if (error) {
      test(`throws for ${description}`, () => {
        expect(() => {
          tryf(lists)
        }).toThrow(error)
      })
    } else {
      test(`does not throw for ${description}`, () => {
        expect(() => {
          tryf(lists)
        }).not.toThrow()
      })
    }
  }
})
