import { setupTestEnv } from '@keystone-6/api-tests/test-runner'
import { relationship, text } from '@keystone-6/core/fields'
import { list, type ListSchemaConfig } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { dbProvider, testConfig } from '../utils'

type ListConfig = {
  name: string
  isFilterable?: boolean
  isOrderable?: boolean
  omit?:
    | true
    | {
        query?: boolean
        create?: boolean
        update?: boolean
        delete?: boolean
      }
}

type FieldConfig = {
  isFilterable?: boolean
  isOrderable?: boolean
  omit?:
    | true
    | {
        read?: boolean
        create?: boolean
        update?: boolean
      }
}

function yesNo (x: boolean | undefined) {
  if (x === true) return 'T'
  if (x === false) return 'F'
  return 'U'
}

function join (o: object) {
  return Object.entries(o)
    .map(([k, v]) => `${k}${v}`)
    .join('_')
}

function getFieldPrefix ({ isFilterable, isOrderable, omit }: FieldConfig) {
  return join({
    Filterable: yesNo(isFilterable),
    Orderable: yesNo(isOrderable),
    Omit:
      omit === undefined ? 'U'
    : omit === true ? 'T'
    : [omit.read, omit.create, omit.update].map(yesNo).join('')
  })
}

const listMatrix: ListConfig[] = []
for (const isFilterable of [undefined, false]) {
  for (const isOrderable of [undefined, false]) {
    const prefix = `List_Filterable${yesNo(isFilterable)}_Orderable${yesNo(isOrderable)}`
    listMatrix.push({ name: `${prefix}_OmitU`, isFilterable, isOrderable, omit: undefined })
    listMatrix.push({ name: `${prefix}_OmitT`, isFilterable, isOrderable, omit: true })

    for (const query of [undefined, true]) {
      for (const create of [undefined, true]) {
        for (const update of [undefined, true]) {
          for (const delete_ of [undefined, true]) {
            const suffix = [query, create, update, delete_].map(yesNo).join('')
            listMatrix.push({
              name: `${prefix}_Omit${suffix}`,
              isFilterable,
              isOrderable,
              omit: {
                query,
                create,
                update,
                delete: delete_,
              }
            })
          }
        }
      }
    }
  }
}

const listMatrixSet = new Set([...listMatrix.map(x => x.name)])
if (listMatrixSet.size !== listMatrix.length) throw new Error('oh oh')

const fieldMatrix: FieldConfig[] = []
for (const isFilterable of [undefined, false]) {
  for (const isOrderable of [undefined, false]) {
    fieldMatrix.push({ isFilterable, isOrderable, omit: undefined })
    fieldMatrix.push({ isFilterable, isOrderable, omit: true })

    for (const read of [undefined, true]) {
      for (const create of [undefined, true]) {
        for (const update of [undefined, true]) {
          fieldMatrix.push({
            isFilterable,
            isOrderable,
            omit: {
              read,
              create,
              update,
            },
          })
        }
      }
    }
  }
}

const lists: ListSchemaConfig = {}

for (const listConfig of listMatrix) {
  lists[listConfig.name] = list({
    access: allowAll,
    fields: {
      name: text(),
      ...Object.fromEntries(function* () {
        for (const fieldConfig of fieldMatrix) {
          yield [`Field_${getFieldPrefix(fieldConfig)}`, text({
            graphql: { omit: fieldConfig.omit },
            isFilterable: fieldConfig.isFilterable,
            isOrderable: fieldConfig.isOrderable,
          })]
        }
      }())
    },
    defaultIsFilterable: listConfig.isFilterable,
    defaultIsOrderable: listConfig.isOrderable,
    graphql: {
      plural: listConfig.name + 's',
      omit: listConfig.omit,
    },
  })
}

// TODO: FIXME: skip for now, MySQL has a limit on the number of indexes
if (dbProvider !== 'mysql') {
  lists.RelatedToAll = list({
    access: allowAll,
    fields: Object.fromEntries(function* () {
      for (const listConfig of listMatrix) {
        // WARNING: if names exceed some length, expect duplicate _AB_unique index errors
        yield [`R${listConfig.name}_one`, relationship({
          ref: listConfig.name,
          many: false,
        })]

        yield [`R${listConfig.name}_many`, relationship({
          ref: listConfig.name,
          many: true,
        })]
      }
    }()),
    graphql: {
      plural: 'RelatedToAlls',
    },
  })
}

const introspectionQuery = `{
  __schema {
    types {
      name
      fields {
        name
      }
    }
    queryType {
      fields {
        name
      }
    }
    mutationType {
      fields {
        name
      }
    }
  }
  keystone {
    adminMeta {
      lists {
        key
      }
    }
  }
}`

type IntrospectionResult = {
  __schema: {
    types: {
      name: string
      fields: {
        name: string
      }[]
    }[]
    queryType: {
      fields: {
        name: string
      }[]
    }
    mutationType: {
      fields: {
        name: string
      }[]
    }
  }
  keystone: {
    adminMeta: {
      lists: {
        key: string
      }[]
    }
  }
}

function dropPostgresThings (data: any) {
  data.__schema.types = data.__schema.types.filter((x: any) => x.name !== 'QueryMode')
  for (const x of data.__schema.types) {
    x.inputFields = x.inputFields?.filter((x: any) => x.name !== 'mode')
  }
}

// TODO: dont use snapshots
describe(`Schema (${dbProvider})`, () => {
  const config = testConfig({ lists })

  test('Public', async () => {
    const { testArgs: { context } } = await setupTestEnv({ config })
    const data = await context.graphql.run<IntrospectionResult, any>({ query: introspectionQuery })
    dropPostgresThings(data)

    const schemaTypes = data.__schema.types.map(x => x.name.toLowerCase())
    const adminMetaLists = data.keystone.adminMeta.lists.map(x => x.key.toLowerCase())
    const queries = data.__schema.queryType.fields.map(x => x.name.toLowerCase())
    const mutations = data.__schema.mutationType.fields.map(x => x.name.toLowerCase())

    for (const l of listMatrix) {
      const name = l.name.toLowerCase()
      if (l.omit === true) {
        expect(schemaTypes).not.toContain(name)
        expect(adminMetaLists).not.toContain(name)
        expect(mutations).not.toContain(`create${name}`)
        expect(mutations).not.toContain(`update${name}`)
        expect(mutations).not.toContain(`delete${name}`)
        continue
      }

      expect(schemaTypes).toContain(name)

      if (l.omit?.query) {
        expect(adminMetaLists).not.toContain(name) // TODO: see create-admin-meta.ts#L102
        expect(queries).not.toContain(name)
        expect(queries).not.toContain(name + 's')
      } else {
        expect(adminMetaLists).toContain(name)
        expect(queries).toContain(name)
        expect(queries).toContain(name + 's')
      }

      if (l.omit?.create) {
        expect(mutations).not.toContain(`create${name}`)
      } else {
        expect(mutations).toContain(`create${name}`)
      }

      if (l.omit?.update) {
        expect(mutations).not.toContain(`update${name}`)
      } else {
        expect(mutations).toContain(`update${name}`)
      }

      if (l.omit?.delete) {
        expect(mutations).not.toContain(`delete${name}`)
      } else {
        expect(mutations).toContain(`delete${name}`)
      }
    }
  })

  test('Sudo', async () => {
    const { testArgs: { context } } = await setupTestEnv({ config })
    const data = await context.sudo().graphql.run<IntrospectionResult, any>({ query: introspectionQuery })
    dropPostgresThings(data)

    const schemaTypes = data.__schema.types.map(x => x.name.toLowerCase())
    const amLists = data.keystone.adminMeta.lists.map(x => x.key.toLowerCase())
    const queries = data.__schema.queryType.fields.map(x => x.name.toLowerCase())
    const mutations = data.__schema.mutationType.fields.map(x => x.name.toLowerCase())

    for (const l of listMatrix) {
      const name = l.name.toLowerCase()

      // everything is in the sudo schema, without refrain
      expect(schemaTypes).toContain(name)
      expect(amLists).toContain(name)
      expect(queries).toContain(name)
      expect(queries).toContain(name + 's')
      expect(mutations).toContain(`create${name}`)
      expect(mutations).toContain(`update${name}`)
      expect(mutations).toContain(`delete${name}`)
    }
  })
})
