import assert from 'node:assert/strict'
import { test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, integer, relationship, text } from '@keystone-6/core/fields'
import type { KeystoneContext } from '@keystone-6/core/types'
import { setupTestEnv, setupTestSuite } from './utils.ts'

let extensionMode = 'filter'
let childCalls = 0
const extendedSuite = setupTestSuite({
  config: {
    db: {
      extendPrismaClient: client =>
        client.$extends({
          query: {
            $allModels: {
              async findMany({ model, args, query }: any) {
                if (model === 'Parent' && extensionMode === 'parent' && args.select?.children) {
                  throw new Error('Unexpected parent relation query')
                }
                if (model !== 'Child') return query(args)

                childCalls++
                if (extensionMode === 'error') throw new Error('Child extension denied the read')
                if (extensionMode === 'filter') {
                  return query({ ...args, where: { AND: [args.where, { visible: true }] } })
                }
                if (extensionMode === 'limit') return query({ ...args, take: 1 })

                const items = await query(args)
                if (extensionMode === 'transform') {
                  return items.map((item: any) => ({ ...item, name: `Extension: ${item.name}` }))
                }
                return items
              },
            },
          },
        }),
    },
    lists: {
      Parent: list({
        access: allowAll,
        fields: {
          name: text(),
          children: relationship({ ref: 'Child.parent', many: true }),
          sharedChildren: relationship({ ref: 'Child.parents', many: true }),
        },
      }),
      Child: list({
        access: allowAll,
        fields: {
          name: text(),
          rank: integer(),
          visible: checkbox(),
          parent: relationship({ ref: 'Parent.children' }),
          parents: relationship({ ref: 'Parent.sharedChildren', many: true }),
        },
      }),
    },
  },
})()

const extendedFixture = extendedSuite.then(async ({ context }) => {
  const parents = []
  for (const name of ['A', 'B']) {
    const parent = await context.db.Parent.createOne({ data: { name } })
    parents.push(parent)
    for (const rank of [1, 2]) {
      await context.db.Child.createOne({
        data: {
          name: `${name}-${rank}`,
          rank,
          visible: rank === 1,
          parent: { connect: { id: parent.id } },
        },
      })
    }
  }
  for (const rank of [1, 2]) {
    await context.db.Child.createOne({
      data: {
        name: `Shared-${rank}`,
        rank,
        visible: rank === 1,
        parents: { connect: parents.map(parent => ({ id: parent.id })) },
      },
    })
  }
  return { context, ids: parents.map(parent => String(parent.id)) }
})

async function read(context: KeystoneContext, ids: string[], selection: string) {
  const result = await context.graphql.run<{ parents: any[] }, { ids: string[] }>({
    query: `query($ids: [ID!]!) {
      parents(where: { id: { in: $ids } }, orderBy: { name: asc }) { name ${selection} }
    }`,
    variables: { ids },
  })
  return JSON.parse(JSON.stringify(result.parents)) as any[]
}

for (const field of ['children', 'sharedChildren']) {
  for (const mode of ['filter', 'transform', 'limit']) {
    test(`relationship reads preserve child query extension ${mode}: ${field}`, async () => {
      const { context, ids } = await extendedFixture
      extensionMode = mode
      const selection = `${field}(orderBy: { rank: asc }) { name }`
      const expected = []
      for (const id of ids) expected.push(...(await read(context, [id], selection)))

      childCalls = 0
      const result = await read(context, ids, selection)
      assert.deepEqual(result, expected)
      assert.equal(childCalls, ids.length)
    })
  }
}

test('child extension errors remain visible for every parent', async () => {
  const { context } = await extendedFixture
  extensionMode = 'error'
  childCalls = 0
  const result = await context.graphql.raw({ query: 'query { parents { children { name } } }' })
  assert.equal(result.errors?.length, 2)
  for (const error of result.errors ?? []) assert.match(error.message, /Child extension denied/)
  assert.equal(childCalls, 2)
})

test('custom clients do not receive new parent relation queries', async () => {
  const { context, ids } = await extendedFixture
  extensionMode = 'parent'
  const result = await read(context, ids, 'children { name }')
  assert.ok(result.every(parent => parent.children.length === 2))
})

test('child query extensions remain active in derived and transaction contexts', async () => {
  const { context, ids } = await extendedFixture
  extensionMode = 'filter'
  for (const derived of [context.withSession({}), context.internal(), context.sudo()]) {
    const result = await read(derived, ids, 'children { name }')
    assert.ok(result.every(parent => parent.children.length === 1))
  }
  await context.transaction(async transaction => {
    const result = await read(transaction, ids, 'children { name }')
    assert.ok(result.every(parent => parent.children.length === 1))
  })
})

test('a custom client hook can change reads and return the same client', async () => {
  const { context, connect, disconnect } = await setupTestEnv({
    db: {
      extendPrismaClient(client) {
        const findMany = client.Child.findMany.bind(client.Child)
        client.Child.findMany = (args: any) =>
          findMany({
            ...args,
            where: { AND: [args.where, { visible: true }] },
          })
        return client
      },
    },
    lists: {
      Parent: list({
        access: allowAll,
        fields: { name: text(), children: relationship({ ref: 'Child.parent', many: true }) },
      }),
      Child: list({
        access: allowAll,
        fields: {
          name: text(),
          visible: checkbox(),
          parent: relationship({ ref: 'Parent.children' }),
        },
      }),
    },
  })
  await connect()
  try {
    const ids = []
    for (const name of ['A', 'B']) {
      const parent = await context.db.Parent.createOne({ data: { name } })
      ids.push(String(parent.id))
      await context.db.Child.createOne({
        data: { name: 'Hidden', visible: false, parent: { connect: { id: parent.id } } },
      })
    }
    const result = await read(context, ids, 'children { name }')
    assert.ok(result.every(parent => parent.children.length === 0))
  } finally {
    await disconnect()
  }
})

const driverReads: { sql: string; rows: number }[] = []
function observeQueries(connection: any) {
  const queryRaw = connection.queryRaw.bind(connection)
  connection.queryRaw = async (query: any) => {
    const result = await queryRaw(query)
    driverReads.push({ sql: query.sql, rows: result.rows.length })
    return result
  }
  if (connection.startTransaction) {
    const startTransaction = connection.startTransaction.bind(connection)
    connection.startTransaction = async (...args: any[]) =>
      observeQueries(await startTransaction(...args))
  }
  return connection
}

const paginationSuite = setupTestSuite({
  wrap(config) {
    const options = config.db.prismaClientOptions
    return {
      ...config,
      db: {
        ...config.db,
        prismaClientOptions() {
          const opts = options()
          const connect = opts.adapter.connect.bind(opts.adapter)
          opts.adapter.connect = async () => observeQueries(await connect())
          return opts
        },
      },
    }
  },
  config: {
    lists: {
      Parent: list({
        access: allowAll,
        fields: {
          name: text(),
          children: relationship({ ref: 'Child.parent', many: true }),
          sharedChildren: relationship({ ref: 'Child.parents', many: true }),
        },
      }),
      Child: list({
        access: allowAll,
        graphql: { maxTake: 1 },
        fields: {
          name: text(),
          rank: integer(),
          parent: relationship({ ref: 'Parent.children' }),
          parents: relationship({ ref: 'Parent.sharedChildren', many: true }),
        },
      }),
    },
  },
})()

const paginationFixture = paginationSuite.then(async ({ context }) => {
  const ids = []
  for (const name of ['A', 'B']) {
    const parent = await context.db.Parent.createOne({ data: { name } })
    ids.push(String(parent.id))
    await context.prisma.Child.createMany({
      data: Array.from({ length: 200 }, (_, rank) => ({
        parentId: parent.id,
        name: `${name}-${rank}`,
        rank,
      })),
    })
  }
  const children = await context.prisma.Child.findMany({ select: { id: true } })
  for (const id of ids) {
    await context.db.Parent.updateOne({
      where: { id },
      data: { sharedChildren: { connect: children.map((child: any) => ({ id: child.id })) } },
    })
  }
  return { context, ids }
})

for (const field of ['children', 'sharedChildren']) {
  for (const args of ['', ', take: 1', ', take: -1', ', take: 1, skip: 1']) {
    test(`relationship pagination bounds rows transferred from the database (${field}, ${args || 'default maxTake'})`, async () => {
      const { context, ids } = await paginationFixture
      const selection = `${field}(orderBy: { rank: asc }${args}) { name }`
      const expected = []
      for (const id of ids) expected.push(...(await read(context, [id], selection)))

      driverReads.length = 0
      assert.deepEqual(await read(context, ids, selection), expected)
      const childReads = driverReads.filter(
        event => event.sql.includes('Child') && event.sql.includes('FROM')
      )
      assert.equal(
        childReads.reduce((total, event) => total + event.rows, 0),
        2
      )
      assert.ok(expected.every(parent => parent[field].length === 1))
    })
  }
}

test('the default relationship limit still rejects excessive take', async () => {
  const { context } = await paginationFixture
  const result = await context.graphql.raw({
    query: 'query { parents { children(take: 2) { name } } }',
  })
  assert.equal(result.errors?.length, 2)
})
