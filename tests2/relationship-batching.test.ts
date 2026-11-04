import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { GraphQLObjectType } from 'graphql/index.js'

import { list, selectItem } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { checkbox, integer, relationship, text } from '@keystone-6/core/fields'
import type { BaseItem, KeystoneContext } from '@keystone-6/core/types'
import { setupTestSuite } from './utils.ts'

const calls: { model: string; operation: string; args: any }[] = []
const sql: string[] = []
const hintResults: BaseItem[][] = []
let failNext = false
let blockNext: (() => Promise<void>) | undefined
const observedClients = new WeakSet<object>()

const suite = setupTestSuite({
  wrap(config) {
    const prismaClientOptions = config.db.prismaClientOptions
    return {
      ...config,
      db: {
        ...config.db,
        prismaClientOptions: () => ({
          ...prismaClientOptions(),
          log: [{ emit: 'event', level: 'query' }],
        }),
      },
    }
  },
  config: {
    db: {
      async onConnect(context) {
        const client = context.prisma
        if (observedClients.has(client)) return
        observedClients.add(client)
        client.$on('query', (event: { query: string }) => sql.push(event.query))

        // Observe the default client without installing a query extension. Custom
        // client behavior is covered separately by the regression tests.
        for (const model of Object.keys(context.__internal.lists)) {
          const findMany = client[model].findMany.bind(client[model])
          client[model].findMany = async (args: any) => {
            calls.push({ model, operation: 'findMany', args })
            if (model === 'Parent' && args.select?.children) {
              if (failNext) {
                failNext = false
                throw new Error('Relationship batch failed')
              }
              if (blockNext) {
                const block = blockNext
                blockNext = undefined
                await block()
              }
            }
            return findMany(args)
          }
        }
      },
    },
    lists: {
      Parent: list({
        access: allowAll,
        fields: {
          name: text(),
          children: relationship({ ref: 'Child.parent', many: true }),
          tags: relationship({ ref: 'Tag.parents', many: true }),
          implicitTags: relationship({ ref: 'Tag', many: true }),
        },
      }),
      Child: list({
        access: {
          operation: {
            create: allowAll,
            update: allowAll,
            delete: allowAll,
            query: {
              one: allowAll,
              many: ({ session }) => !session?.denyChildren,
              count: allowAll,
            },
          },
          filter: {
            query: {
              one: allowAll,
              many: ({ session }) => session?.seeHidden || { visible: { equals: true } },
              count: allowAll,
            },
          },
        },
        graphql: {
          cacheHint: selectItem(
            ({ results }) => {
              if (Array.isArray(results)) hintResults.push(results)
              return { maxAge: 10 }
            },
            { visible: true }
          ),
        },
        fields: {
          name: text(),
          rank: integer(),
          visible: checkbox(),
          extra: text(),
          secret: text({ access: { read: { item: denyAll, filter: denyAll, order: denyAll } } }),
          parent: relationship({ ref: 'Parent.children' }),
        },
      }),
      Tag: list({
        access: allowAll,
        fields: { name: text(), parents: relationship({ ref: 'Parent.tags', many: true }) },
      }),
      NumberParent: list({
        db: { idField: { kind: 'autoincrement' } },
        access: allowAll,
        fields: { children: relationship({ ref: 'NumberChild', many: true }) },
      }),
      NumberChild: list({ access: allowAll, fields: { name: text() } }),
    },
  },
})()

const fixture = suite.then(async ({ context }) => {
  const shared = await context.db.Tag.createOne({ data: { name: 'Shared' } })
  const parents: BaseItem[] = []
  const children: BaseItem[][] = []
  const tags: (BaseItem | undefined)[] = []
  for (let index = 0; index < 6; index++) {
    let tag: BaseItem | undefined
    if (index !== 5) tag = await context.db.Tag.createOne({ data: { name: `Private ${index}` } })
    tags.push(tag)
    const connectedTags = tag ? [{ id: shared.id }, { id: tag.id }] : []
    const parent = await context.db.Parent.createOne({
      data: {
        name: `Parent ${index}`,
        tags: { connect: connectedTags },
        implicitTags: { connect: connectedTags },
      },
    })
    parents.push(parent)
    children.push([])
    if (index === 5) continue
    for (let rank = 1; rank <= 3; rank++) {
      children[index].push(
        await context.db.Child.createOne({
          data: {
            name: `${index}-${rank}`,
            rank,
            visible: rank !== 3,
            extra: 'Extra',
            secret: 'Hidden',
            parent: { connect: { id: parent.id } },
          },
        })
      )
    }
  }
  return { context, parents, children, shared, tags }
})

function resetCalls() {
  calls.length = 0
  sql.length = 0
  hintResults.length = 0
}

function relationCalls(field = 'children') {
  return calls.filter(call => call.model === 'Parent' && call.args.select?.[field])
}

async function readParents(context: KeystoneContext, ids: BaseItem['id'][], fields: string) {
  const result = await context.graphql.run<{ parents: any[] }, { ids: string[] }>({
    query: `query ($ids: [ID!]!) {
      parents(where: { id: { in: $ids } }, orderBy: { name: asc }) { id ${fields} }
    }`,
    variables: { ids: ids.map(String) },
  })
  return JSON.parse(JSON.stringify(result.parents)) as any[]
}

test('to-many relationships batch across parents with access filters and cache hint selections', async t => {
  const { context, parents } = await fixture
  resetCalls()
  const field = (context.graphql.schema.getType('Parent') as GraphQLObjectType).getFields().children
  const resolve = field.resolve!
  field.resolve = (source, args, context, info) =>
    resolve(
      source,
      args,
      context,
      Object.assign(info, {
        cacheControl: { cacheHint: { restrict() {} }, setCacheHint() {} },
      })
    )
  let result: any[]
  try {
    result = await readParents(
      context,
      parents.map(parent => parent.id),
      'children(orderBy: { rank: asc }) { name }'
    )
  } finally {
    field.resolve = resolve
  }
  t.diagnostic(`Six parents: ${sql.length} SQL queries including the root read`)

  assert.deepEqual(
    result,
    parents.map((parent, index) => ({
      id: parent.id,
      children: index === 5 ? [] : [{ name: `${index}-1` }, { name: `${index}-2` }],
    }))
  )
  assert.equal(relationCalls().length, 1)
  assert.deepEqual(
    relationCalls()[0].args.where.id.in,
    parents.map(parent => parent.id)
  )
  assert.deepEqual(relationCalls()[0].args.select.children.select, {
    id: true,
    name: true,
    visible: true,
  })
  assert.equal(
    calls.filter(call => call.model === 'Child' && call.operation === 'findMany').length,
    0
  )
  assert.ok(sql.length <= 3, `Expected at most 3 SQL queries, received ${sql.length}`)
  assert.equal(hintResults.length, parents.length)
  assert.deepEqual(
    hintResults.map(items => items.map(item => item.name)),
    result.map(parent => parent.children.map((child: any) => child.name))
  )
})

for (const field of ['tags', 'implicitTags']) {
  test(`many-to-many ${field} batches shared and empty relationships`, async t => {
    const { context, parents, shared, tags } = await fixture
    resetCalls()
    const result = await readParents(
      context,
      parents.map(parent => parent.id),
      `${field}(orderBy: { name: asc }) { id name }`
    )
    assert.deepEqual(
      result,
      parents.map((parent, index) => ({
        id: parent.id,
        [field]:
          index === 5
            ? []
            : [
                { id: tags[index]!.id, name: `Private ${index}` },
                { id: shared.id, name: 'Shared' },
              ],
      }))
    )
    t.diagnostic(`Six parents: ${sql.length} SQL queries including the root read`)
    assert.equal(relationCalls(field).length, 1)
    assert.equal(
      calls.filter(call => call.model === 'Tag' && call.operation === 'findMany').length,
      0
    )
    assert.ok(sql.length <= 4, `Expected at most 4 SQL queries, received ${sql.length}`)
  })
}

for (const selection of [
  'children(orderBy: { rank: asc }, take: 1, skip: 1) { id name }',
  'children(orderBy: { rank: asc }, take: -1) { id name }',
  'children(where: { rank: { gte: 2 } }, orderBy: { rank: desc }) { id name }',
  'tags(orderBy: { name: asc }, take: 1, skip: 1) { id name }',
  `a: children(take: 1, orderBy: { rank: asc }) { name }
   duplicate: children(take: 1, orderBy: { rank: asc }) { name }
   b: children(take: 2, orderBy: { rank: desc }) { name }
   extra: children { extra }`,
]) {
  test(`batched results match individual reads: ${selection}`, async () => {
    const { context, parents } = await fixture
    const ids = parents.map(parent => parent.id)
    const expected = []
    for (const id of ids) expected.push(...(await readParents(context, [id], selection)))
    resetCalls()
    assert.deepEqual(await readParents(context, ids, selection), expected)
    const field = selection.startsWith('tags') ? 'tags' : 'children'
    let expectedBatches = 1
    if (!selection.startsWith('a:') && selection.includes('take:')) expectedBatches = 0
    assert.equal(relationCalls(field).length, expectedBatches)
  })
}

test('cursors retain per-parent membership and hidden cursor protection', async () => {
  const { context, parents, children } = await fixture
  const ids = parents.map(parent => parent.id)
  for (const cursor of [children[0][0], children[0][2]]) {
    const selection = `children(orderBy: { rank: asc }, cursor: { id: "${cursor.id}" }, take: 2, skip: 1) { id name }`
    const expected = []
    for (const id of ids) expected.push(...(await readParents(context, [id], selection)))
    resetCalls()
    assert.deepEqual(await readParents(context, ids, selection), expected)
    assert.equal(relationCalls().length, 0)
    if (cursor === children[0][2]) assert.ok(expected.every(parent => parent.children.length === 0))
  }
})

test('one parent keeps a flat child query and later reads do not reuse completed batches', async () => {
  const { context, parents } = await fixture
  for (let attempt = 0; attempt < 2; attempt++) {
    resetCalls()
    const result = await readParents(context, [parents[0].id], 'children { name }')
    assert.equal(result[0].children.length, 2)
    assert.equal(relationCalls().length, 0)
    assert.equal(
      calls.filter(call => call.model === 'Child' && call.operation === 'findMany').length,
      1
    )
    assert.equal(sql.length, 2)
  }
})

test('operation, filter, order, and field access checks still apply before batching', async () => {
  const { context, parents } = await fixture
  const ids = parents.map(parent => parent.id)
  resetCalls()
  const denied = await readParents(
    context.withSession({ denyChildren: true }),
    ids,
    'children { name }'
  )
  assert.ok(denied.every(parent => parent.children.length === 0))
  assert.equal(relationCalls().length, 0)

  const fields = await readParents(context, ids, 'children { secret }')
  assert.ok(fields.every(parent => parent.children.every((child: any) => child.secret === null)))
  for (const selection of [
    'children(where: { secret: { equals: "Hidden" } }) { name }',
    'children(orderBy: { secret: asc }) { name }',
  ]) {
    resetCalls()
    const result = await context.graphql.raw({
      query: `query { parents { ${selection} } }`,
    })
    assert.equal(result.errors?.length, parents.length)
    assert.equal(relationCalls().length, 0)
    assert.equal(
      calls.filter(call => call.model === 'Child' && call.operation === 'findMany').length,
      0
    )
  }
})

test('sessions, sudo, and transaction contexts keep separate pending batches', async () => {
  const { context, parents } = await fixture
  const ids = parents.map(parent => parent.id)
  const selection = 'children(orderBy: { rank: asc }) { name }'
  resetCalls()
  const [normal, otherSession, sudo] = await Promise.all([
    readParents(context, ids, selection),
    readParents(context.withSession({}), ids, selection),
    readParents(context.sudo(), ids, selection),
  ])
  assert.deepEqual(otherSession, normal)
  assert.equal(normal[0].children.length, 2)
  assert.equal(sudo[0].children.length, 3)
  assert.equal(relationCalls().length, 3)

  resetCalls()
  await context.transaction(async transaction => {
    const [outside, inside] = await Promise.all([
      readParents(context, ids, selection),
      readParents(transaction, ids, selection),
    ])
    assert.deepEqual(inside, outside)
  })
  assert.equal(sql.filter(statement => statement.startsWith('SELECT')).length, 6)
})

test('failed batches do not affect other groups and do not persist', async () => {
  const { context, parents } = await fixture
  failNext = true
  const failed = await context.graphql.raw({
    query: 'query { parents { children { name } tags { name } } }',
  })
  assert.equal(failed.errors?.length, parents.length)
  for (const error of failed.errors ?? []) assert.match(error.message, /Relationship batch failed/)
  const rows = (failed.data as any).parents
  assert.ok(rows.every((parent: any) => parent.children === null))
  assert.ok(rows[0].tags.some((tag: any) => tag.name === 'Shared'))

  resetCalls()
  const recovered = await readParents(
    context,
    parents.map(parent => parent.id),
    'children { name }'
  )
  assert.equal(recovered[0].children.length, 2)
  assert.equal(relationCalls().length, 1)
})

test(
  'new batches dispatch independently while an earlier batch is in flight',
  { timeout: 10_000 },
  async () => {
    const { context, parents } = await fixture
    let release!: () => void
    let notifyStarted!: () => void
    const gate = new Promise<void>(resolve => {
      release = resolve
    })
    const started = new Promise<void>(resolve => {
      notifyStarted = resolve
    })
    blockNext = async () => {
      notifyStarted()
      await gate
    }
    const ids = parents.map(parent => parent.id)
    const first = readParents(context, ids, 'children { name }')
    await started
    try {
      resetCalls()
      const second = await readParents(context, ids, 'children { name }')
      assert.equal(second[0].children.length, 2)
      assert.equal(relationCalls().length, 1)
    } finally {
      release()
    }
    await first
  }
)

test('batched reads use the transaction client and see later writes', async () => {
  const { context, parents, children } = await fixture
  const ids = parents.map(parent => parent.id)
  await assert.rejects(
    context.transaction(async transaction => {
      await transaction.db.Child.updateOne({
        where: { id: String(children[0][0].id) },
        data: { name: 'Updated' },
      })
      const inside = await readParents(
        transaction,
        ids,
        'children(orderBy: { rank: asc }) { name }'
      )
      assert.equal(inside[0].children[0].name, 'Updated')
      throw new Error('Rollback test')
    }),
    /Rollback test/
  )
  const outside = await readParents(context, ids, 'children(orderBy: { rank: asc }) { name }')
  assert.equal(outside[0].children[0].name, '0-1')
})

test('batched relation mapping supports numeric parent IDs', async () => {
  const { context } = await fixture
  const parents = []
  for (let index = 0; index < 3; index++) {
    parents.push(
      await context.db.NumberParent.createOne({
        data: { children: { create: [{ name: String(index) }] } },
      })
    )
  }
  resetCalls()
  const result = await context.graphql.run<{ numberParents: any[] }, {}>({
    query: 'query { numberParents(orderBy: { id: asc }) { id children { name } } }',
  })
  assert.deepEqual(
    JSON.parse(JSON.stringify(result.numberParents)),
    parents.map((parent, index) => ({
      id: String(parent.id),
      children: [{ name: String(index) }],
    }))
  )
  assert.equal(
    calls.filter(call => call.model === 'NumberParent' && call.args.select?.children).length,
    1
  )
})
