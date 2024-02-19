import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { relationship, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { dbProvider } from '../utils'

function yesNo (x: boolean | undefined) {
  if (x === true) return 'T'
  if (x === false) return 'F'
  return 'U'
}

function makeFieldEntry ({
  isFilterable,
  isOrderable,
  omit
}: {
  isFilterable?: boolean
  isOrderable?: boolean
  omit?:
    | true
    | {
        read?: boolean
        create?: boolean
        update?: boolean
      }
}) {
  const suffix = [
    `Filterable${yesNo(isFilterable)}`,
    `Orderable${yesNo(isOrderable)}`,
    `Omit${
      omit === undefined ? 'U'
    : omit === true ? 'T'
    : [omit.read, omit.create, omit.update].map(yesNo).join('')}`
  ].join('')

  return [`Field_${suffix}`, text({
    graphql: { omit },
    isFilterable,
    isOrderable,
  })] as const
}

function makeList ({
  isFilterable,
  isOrderable,
  omit
}: {
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
}, fieldsMatrix: ReturnType<typeof makeFieldEntry>[]) {
  const prefix = `List_Filterable${yesNo(isFilterable)}_Orderable${yesNo(isOrderable)}` as const
  const name =
    omit === undefined
      ? `${prefix}_OmitU`
      : omit === true
        ? `${prefix}_OmitT`
        : `${prefix}_Omit${[omit.query, omit.create, omit.update, omit.delete].map(yesNo).join('')}`

  return {
    name,
    access: allowAll,
    fields: {
      name: text(),
      ...Object.fromEntries(fieldsMatrix)
    },
    defaultIsFilterable: isFilterable,
    defaultIsOrderable: isOrderable,
    graphql: {
      plural: name + 's',
      omit,
    },
  } as const
}

const listsMatrix = [...function* () {
  const fieldsMatrix = [...function* () {
    for (const isFilterable of [undefined, false]) {
      for (const isOrderable of [undefined, false]) {
        yield makeFieldEntry({ isFilterable, isOrderable, omit: undefined })
        yield makeFieldEntry({ isFilterable, isOrderable, omit: true })

        for (const read of [undefined, true]) {
          for (const create of [undefined, true]) {
            for (const update of [undefined, true]) {
              yield makeFieldEntry({
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
  }()]

  for (const isFilterable of [undefined, false]) {
    for (const isOrderable of [undefined, false]) {
      yield makeList({ isFilterable, isOrderable, omit: undefined }, fieldsMatrix)
      yield makeList({ isFilterable, isOrderable, omit: true }, fieldsMatrix)

      for (const query of [undefined, true]) {
        for (const create of [undefined, true]) {
          for (const update of [undefined, true]) {
            for (const delete_ of [undefined, true]) {
              yield makeList({
                isFilterable,
                isOrderable,
                omit: {
                  query,
                  create,
                  update,
                  delete: delete_,
                }
              }, fieldsMatrix)
            }
          }
        }
      }
    }
  }
}()]

// TODO: FIXME: skip for now, MySQL has a limit on the number of indexes
if (dbProvider !== 'mysql') {
  listsMatrix.push({
    name: 'RelatedToAll',
    access: allowAll,
    fields: {
      name: text(),
      ...Object.fromEntries(function* () {
        for (const l of listsMatrix) {
          // WARNING: if names exceed some length, expect duplicate _AB_unique index errors
          yield [`R${l.name}_one`, relationship({
            ref: l.name,
            many: false,
          })] as const

          yield [`R${l.name}_many`, relationship({
            ref: l.name,
            many: true,
          })] as const
        }
      }()),
    },
    defaultIsFilterable: undefined,
    defaultIsOrderable: undefined,
    graphql: {
      plural: 'RelatedToAlls',
      omit: undefined
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

describe(`Omit (${dbProvider})`, () => {
  const config = {
    lists: Object.fromEntries(listsMatrix.map(({ name, ...l }) => [name, list(l)]))
  }

  test('Common Schema', setupTestRunner({ config })(async ({ context }) => {
    const data = await context.graphql.run<IntrospectionResult, any>({ query: introspectionQuery })

    const schemaTypes = data.__schema.types.map(x => x.name.toLowerCase())
    const adminMetaLists = data.keystone.adminMeta.lists.map(x => x.key.toLowerCase())
    const queries = data.__schema.queryType.fields.map(x => x.name.toLowerCase())
    const mutations = data.__schema.mutationType.fields.map(x => x.name.toLowerCase())

    for (const l of listsMatrix) {
      const name = l.name.toLowerCase()
      if (l.graphql.omit === true) {
        expect(schemaTypes).not.toContain(name)
        expect(adminMetaLists).not.toContain(name)
        expect(mutations).not.toContain(`create${name}`)
        expect(mutations).not.toContain(`update${name}`)
        expect(mutations).not.toContain(`delete${name}`)
        continue
      }

      expect(schemaTypes).toContain(name)

      if (l.graphql.omit?.query) {
        expect(adminMetaLists).not.toContain(name) // TODO: see create-admin-meta.ts#L102
        expect(queries).not.toContain(name)
        expect(queries).not.toContain(name + 's')
      } else {
        expect(adminMetaLists).toContain(name)
        expect(queries).toContain(name)
        expect(queries).toContain(name + 's')
      }

      if (l.graphql.omit?.create) {
        expect(mutations).not.toContain(`create${name}`)
      } else {
        expect(mutations).toContain(`create${name}`)
      }

      if (l.graphql.omit?.update) {
        expect(mutations).not.toContain(`update${name}`)
      } else {
        expect(mutations).toContain(`update${name}`)
      }

      if (l.graphql.omit?.delete) {
        expect(mutations).not.toContain(`delete${name}`)
      } else {
        expect(mutations).toContain(`delete${name}`)
      }
    }
  }))

  test('Sudo Schema', setupTestRunner({ config })(async ({ context }) => {
    const data = await context.sudo().graphql.run<IntrospectionResult, any>({ query: introspectionQuery })

    const schemaTypes = data.__schema.types.map(x => x.name.toLowerCase())
    const amLists = data.keystone.adminMeta.lists.map(x => x.key.toLowerCase())
    const queries = data.__schema.queryType.fields.map(x => x.name.toLowerCase())
    const mutations = data.__schema.mutationType.fields.map(x => x.name.toLowerCase())

    for (const l of listsMatrix) {
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
  }))
})
