import assert from 'node:assert/strict'
import { test } from 'node:test'

import { action, g, getSelectionFromInfo, list, selectFields } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import {
  bigInt,
  bytes,
  calendarDay,
  checkbox,
  decimal,
  file,
  float,
  image,
  integer,
  json,
  multiselect,
  password,
  relationship,
  select,
  text,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'
import { dbProvider, setupTestEnv, setupTestSuite } from './utils.ts'

let queryFields: string[] = []
let virtualFields: string[] = []
let originalFields: string[] = []
let updatedFields: string[] = []
const prismaCalls: { model: string; operation: string; args: Record<string, unknown> }[] = []

const suite = setupTestSuite({
  config: {
    db: {
      extendPrismaClient: client =>
        client.$extends({
          query: {
            $allModels: {
              $allOperations: async ({ model, operation, args, query }: any) => {
                if (model === 'Post' || model === 'Author') {
                  prismaCalls.push({ model, operation, args })
                }
                return query(args)
              },
            },
          },
        }),
    },
    graphql: {
      extendGraphqlSchema: g.extend(base => ({
        query: {
          selectedPost: g.field({
            type: base.object('Post'),
            args: { id: g.arg({ type: g.nonNull(g.ID) }) },
            resolve(_source, { id }, context, info) {
              return context.db.Post.findOne({
                where: { id },
                select: getSelectionFromInfo(context, info, 'Post'),
              })
            },
          }),
          selectedPostPrisma: g.field({
            type: base.object('Post'),
            args: { id: g.arg({ type: g.nonNull(g.ID) }) },
            resolve(_source, { id }, context, info) {
              return context.prisma.post.findFirst({
                where: { id },
                select: getSelectionFromInfo(context, info, 'Post'),
              })
            },
          }),
          selectedPosts: g.field({
            type: g.list(g.nonNull(base.object('Post'))),
            args: { id: g.arg({ type: g.nonNull(g.ID) }) },
            resolve(_source, { id }, context, info) {
              return context.db.Post.findMany({
                where: { id: { equals: id } },
                select: getSelectionFromInfo(context, info, 'Post'),
              })
            },
          }),
        },
      })),
    },
    lists: {
      Post: list({
        access: allowAll,
        fields: {
          title: text({
            access: {
              read: {
                item: selectFields(
                  ({ item }) => {
                    queryFields = Object.keys(item)
                    return true
                  },
                  { status: true }
                ),
                filter: allowAll,
                order: allowAll,
              },
            },
          }),
          status: text(),
          extra: text(),
          plain: text({
            access: {
              read: {
                item: () => true,
                filter: allowAll,
                order: allowAll,
              },
            },
          }),
          author: relationship({ ref: 'Author.posts' }),
          summary: virtual({
            field: g.listItemField({
              select: { status: true },
              type: g.String,
              resolve(item) {
                virtualFields = Object.keys(item)
                return item.status
              },
            }),
          }),
        },
        hooks: {
          validate: {
            update: selectFields(
              ({ item }) => {
                originalFields = Object.keys(item)
              },
              { status: true }
            ),
          },
          afterOperation: {
            update: selectFields(
              ({ item }) => {
                updatedFields = Object.keys(item)
              },
              { status: true }
            ),
          },
        },
      }),
      Author: list({
        access: allowAll,
        fields: {
          name: text(),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
      }),
    },
  },
})

test('getSelectionFromInfo rejects a mismatched list key', async () => {
  const { context } = await suite()
  const returnType = context.graphql.schema.getQueryType()!.getFields().author.type
  assert.throws(
    () =>
      getSelectionFromInfo(
        context,
        { returnType } as Parameters<typeof getSelectionFromInfo>[1],
        'Post'
      ),
    /Post does not match GraphQL return type Author/
  )
})

test('cache hint columns are selected only for list queries', async () => {
  const calls: { operation: string; select: unknown }[] = []
  const { context, connect, disconnect } = await setupTestEnv({
    db: {
      extendPrismaClient: client =>
        client.$extends({
          query: {
            post: {
              $allOperations: async ({ operation, args, query }: any) => {
                calls.push({ operation, select: args.select })
                return query(args)
              },
            },
          },
        }),
    },
    lists: {
      Post: list({
        access: allowAll,
        graphql: {
          cacheHint: selectFields(() => ({ maxAge: 10 }), { status: true }),
        },
        fields: { title: text(), status: text() },
      }),
    },
  })

  await connect()
  try {
    await context.db.Post.createOne({
      data: { title: 'Selected', status: 'draft' },
      select: { title: true },
    })
    assert.deepEqual(calls.find(call => call.operation === 'create')?.select, {
      id: true,
      title: true,
    })

    calls.length = 0
    await context.graphql.run({ query: '{ posts { title } }' })
    assert.deepEqual(calls.find(call => call.operation === 'findMany')?.select, {
      id: true,
      title: true,
      status: true,
    })
  } finally {
    await disconnect()
  }
})

test('context.db accepts a Prisma item selection', async () => {
  const { context } = await suite()
  prismaCalls.length = 0
  const post = await context.db.Post.createOne({
    data: { title: 'Selected', status: 'draft', extra: 'unused' },
    select: { title: true },
  })
  assert.deepEqual(post, { id: post.id, title: 'Selected' })
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'create')
      .map(call => call.args.select),
    [{ id: true, title: true }]
  )

  prismaCalls.length = 0
  const selected = await context.db.Post.findOne({
    where: { id: String(post.id) },
    select: { title: true },
  })
  assert.deepEqual(selected, { id: post.id, title: 'Selected' })
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, title: true }]
  )

  prismaCalls.length = 0
  const many = await context.db.Post.findMany({
    where: { id: { equals: String(post.id) } },
    select: { status: true },
  })
  assert.deepEqual(many, [{ id: post.id, status: 'draft' }])
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, status: true }]
  )
  const all = await context.db.Post.findMany()
  assert.equal(all[0]?.title, 'Selected')

  prismaCalls.length = 0
  await context.db.Post.updateOne({
    where: { id: String(post.id) },
    data: { title: 'Updated' },
    select: { title: true },
  })
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'update')
      .map(call => call.args.select),
    [{ id: true, title: true, status: true }]
  )

  prismaCalls.length = 0
  const deleted = await context.db.Post.deleteOne({
    where: { id: String(post.id) },
    select: { title: true },
  })
  assert.deepEqual(deleted, { id: post.id, title: 'Updated' })
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'delete')
      .map(call => call.args.select),
    [{ id: true, title: true }]
  )
})

test('context.db validates selected Prisma columns and true values', async () => {
  const { context } = await suite()
  const post = await context.db.Post.createOne({ data: { title: 'Selected', status: 'draft' } })
  prismaCalls.length = 0

  const selected = await context.db.Post.findOne({
    where: { id: String(post.id) },
    select: { status: true },
  })
  assert.deepEqual(selected, { id: post.id, status: 'draft' })

  const invalidSelections: [unknown, RegExp][] = [
    [{ title: false }, /Post\.select\.title must be true/],
    [{ title: undefined }, /Post\.select\.title must be true/],
    [{ title: null }, /Post\.select\.title must be true/],
    [{ title: { select: { status: true } } }, /Post\.select\.title must be true/],
    [{ title: 'true' }, /Post\.select\.title must be true/],
    [{ author: true }, /unknown Prisma item column: author/],
    [{ missing: true }, /unknown Prisma item column: missing/],
    [[], /Post\.select must be an object/],
    [null, /Post\.select must be an object/],
  ]
  for (const [select, message] of invalidSelections) {
    await assert.rejects(
      context.db.Post.findOne({ where: { id: String(post.id) }, select: select as any }),
      message
    )
  }
  assert.equal(
    prismaCalls.filter(call => call.model === 'Post' && call.operation === 'findFirst').length,
    1
  )
})

test('custom resolvers can select the item fields requested by GraphQL', async () => {
  const { context } = await suite()
  const post = await context.db.Post.createOne({
    data: { title: 'From custom resolver', plain: 'Needs full item' },
  })
  prismaCalls.length = 0
  const result = await context.graphql.run({
    query: 'query ($id: ID!) { selectedPost(id: $id) { title } }',
    variables: { id: post.id },
  })
  assert.equal(
    JSON.stringify(result),
    JSON.stringify({ selectedPost: { title: 'From custom resolver' } })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, title: true, status: true }]
  )

  prismaCalls.length = 0
  const directPrisma = await context.graphql.run({
    query: 'query ($id: ID!) { selectedPostPrisma(id: $id) { title } }',
    variables: { id: post.id },
  })
  assert.equal(
    JSON.stringify(directPrisma),
    JSON.stringify({ selectedPostPrisma: { title: 'From custom resolver' } })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, title: true, status: true }]
  )

  prismaCalls.length = 0
  const listResult = await context.graphql.run({
    query: 'query ($id: ID!) { selectedPosts(id: $id) { title } }',
    variables: { id: post.id },
  })
  assert.equal(
    JSON.stringify(listResult),
    JSON.stringify({ selectedPosts: [{ title: 'From custom resolver' }] })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, title: true, status: true }]
  )

  prismaCalls.length = 0
  const fallback = await context.graphql.run({
    query: 'query ($id: ID!) { selectedPost(id: $id) { plain } }',
    variables: { id: post.id },
  })
  assert.equal(
    JSON.stringify(fallback),
    JSON.stringify({ selectedPost: { plain: 'Needs full item' } })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, title: true, status: true, extra: true, plain: true, authorId: true }]
  )
})

test('de-optimized selections include columns added to the Prisma schema', async () => {
  let selectedColumns: Partial<Record<string, true>> | undefined
  const { context, connect, disconnect } = await setupTestEnv({
    graphql: {
      extendGraphqlSchema: g.extend(base => ({
        query: {
          selectedPostWithExtra: g.field({
            type: base.object('Post'),
            args: { id: g.arg({ type: g.nonNull(g.ID) }) },
            resolve(_source, { id }, context, info) {
              const select = getSelectionFromInfo(context, info, 'Post')
              selectedColumns = select
              return context.db.Post.findOne({ where: { id }, select })
            },
          }),
        },
      })),
    },
    lists: {
      Post: list({
        access: allowAll,
        db: {
          extendPrismaSchema: schema => schema.slice(0, -1) + '  dbExtra String?\n}',
        },
        fields: {
          title: text(),
          computed: virtual({ field: g.field({ type: g.String, resolve: () => 'ok' }) }),
        },
      }),
    },
  })

  await connect()
  try {
    const post = await context.db.Post.createOne({ data: { title: 'Selected' } })
    const result = await context.graphql.run({
      query: 'query ($id: ID!) { selectedPostWithExtra(id: $id) { computed } }',
      variables: { id: post.id },
    })
    assert.equal(
      JSON.stringify(result),
      JSON.stringify({ selectedPostWithExtra: { computed: 'ok' } })
    )
    assert.equal(selectedColumns?.dbExtra, true)
  } finally {
    await disconnect()
  }
})

test('GraphQL queries and mutations select the fields required by callbacks', async () => {
  const { context } = await suite()
  const post = await context.db.Post.createOne({
    data: { title: 'One', status: 'draft', extra: 'other', plain: 'fallback' },
  })

  prismaCalls.length = 0
  const query = await context.graphql.run({
    query: `query ($id: ID!) {
      posts(where: { id: { equals: $id } }) {
        alias: title
        extra @include(if: false)
      }
    }`,
    variables: { id: post.id },
  })
  assert.equal(JSON.stringify(query), JSON.stringify({ posts: [{ alias: 'One' }] }))
  assert.deepEqual(queryFields.sort(), ['extra', 'id', 'status', 'title'])
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, status: true, title: true, extra: true }]
  )

  prismaCalls.length = 0
  const virtualQuery = await context.graphql.run({
    query: 'query ($id: ID!) { posts(where: { id: { equals: $id } }) { summary } }',
    variables: { id: post.id },
  })
  assert.equal(JSON.stringify(virtualQuery), JSON.stringify({ posts: [{ summary: 'draft' }] }))
  assert.deepEqual(virtualFields.sort(), ['id', 'status'])
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, status: true }]
  )

  prismaCalls.length = 0
  const mutation = await context.graphql.run({
    query: `mutation ($id: ID!) {
      updatePost(where: { id: $id }, data: { title: "Two" }) { title }
    }`,
    variables: { id: post.id },
  })
  assert.equal(JSON.stringify(mutation), JSON.stringify({ updatePost: { title: 'Two' } }))
  assert.deepEqual(originalFields.sort(), ['id', 'status'])
  assert.deepEqual(updatedFields.sort(), ['id', 'status', 'title'])
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, status: true }]
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'update')
      .map(call => call.args.select),
    [{ id: true, status: true, title: true }]
  )

  prismaCalls.length = 0
  const plainQuery = await context.graphql.run({
    query: 'query ($id: ID!) { posts(where: { id: { equals: $id } }) { plain } }',
    variables: { id: post.id },
  })
  assert.equal(JSON.stringify(plainQuery), JSON.stringify({ posts: [{ plain: 'fallback' }] }))
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findMany')
      .map(call => call.args.select),
    [undefined]
  )
})

test('relationship queries select the foreign key and requested related columns', async () => {
  const { context } = await suite()
  const author = await context.db.Author.createOne({ data: { name: 'Ada' } })
  prismaCalls.length = 0
  const post = await context.db.Post.createOne({
    data: { title: 'Related', author: { connect: { id: author.id } } },
  })
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true }]
  )

  prismaCalls.length = 0
  const result = await context.graphql.run({
    query: `query ($id: ID!) { post(where: { id: $id }) { author { name } } }`,
    variables: { id: post.id },
  })
  assert.equal(JSON.stringify(result), JSON.stringify({ post: { author: { name: 'Ada' } } }))
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Post' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true, authorId: true }]
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, name: true }]
  )

  prismaCalls.length = 0
  const count = await context.graphql.run({
    query: `query ($id: ID!) { author(where: { id: $id }) { postsCount } }`,
    variables: { id: author.id },
  })
  assert.equal(JSON.stringify(count), JSON.stringify({ author: { postsCount: 1 } }))
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findFirst')
      .map(call => call.args.select),
    [{ id: true }]
  )
})

test('relationship loaders batch matching selections across items', async () => {
  const { context } = await suite()
  const first = await context.db.Author.createOne({ data: { name: 'Ada' } })
  const second = await context.db.Author.createOne({ data: { name: 'Grace' } })
  await context.db.Post.createOne({
    data: { title: 'First', author: { connect: { id: first.id } } },
  })
  await context.db.Post.createOne({
    data: { title: 'Second', author: { connect: { id: second.id } } },
  })

  prismaCalls.length = 0
  const result = (await context.graphql.run({
    query: 'query { posts { title author { name } } }',
  })) as { posts: { title: string; author: { name: string } | null }[] }
  assert.deepEqual(
    result.posts
      .filter(post => post.title === 'First' || post.title === 'Second')
      .map(post => post.author?.name)
      .sort(),
    ['Ada', 'Grace']
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, name: true }]
  )

  prismaCalls.length = 0
  const aliased = (await context.graphql.run({
    query: 'query { posts { title byName: author { name } byId: author { id } } }',
  })) as {
    posts: { title: string; byName: { name: string } | null; byId: { id: string } | null }[]
  }
  assert.deepEqual(
    aliased.posts
      .filter(post => post.title === 'First' || post.title === 'Second')
      .map(post => [post.byName?.name, post.byId?.id])
      .sort(),
    [
      ['Ada', first.id],
      ['Grace', second.id],
    ]
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, name: true }, { id: true }]
  )
})

test('relationship loaders conservatively select fields from fragments with directives', async () => {
  const { context } = await suite()
  const author = await context.db.Author.createOne({ data: { name: 'Ada' } })
  const post = await context.db.Post.createOne({
    data: { title: 'Fragment loader', author: { connect: { id: author.id } } },
  })
  const query = `query ($id: ID!, $showName: Boolean!) {
    posts(where: { id: { equals: $id } }) {
      author { id ...AuthorFields }
    }
  }
  fragment AuthorFields on Author {
    name @include(if: $showName)
  }`

  prismaCalls.length = 0
  const withName = await context.graphql.run({
    query,
    variables: { id: post.id, showName: true },
  })
  assert.equal(
    JSON.stringify(withName),
    JSON.stringify({ posts: [{ author: { id: author.id, name: 'Ada' } }] })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, name: true }]
  )

  prismaCalls.length = 0
  const withoutName = await context.graphql.run({
    query,
    variables: { id: post.id, showName: false },
  })
  assert.equal(
    JSON.stringify(withoutName),
    JSON.stringify({ posts: [{ author: { id: author.id } }] })
  )
  assert.deepEqual(
    prismaCalls
      .filter(call => call.model === 'Author' && call.operation === 'findMany')
      .map(call => call.args.select),
    [{ id: true, name: true }]
  )
})

const storage = {
  async put() {},
  async delete() {},
  url(key: string) {
    return `https://example.test/${key}`
  },
}

let fileHookFields: string[] = []
const strictPrismaCalls: { operation: string; args: Record<string, unknown> }[] = []
const strictSuite = setupTestSuite({
  config: {
    graphql: {
      extendGraphqlSchema(schema) {
        const field = g.listItemField({
          select: { aText: true },
          type: g.String,
          resolve: (item: { aText: string }) => item.aText.toUpperCase(),
        })
        const fields = (schema.getType('FieldSample') as any).getFields()
        fields.uppercaseText = {
          ...fields.aText,
          name: 'uppercaseText',
          extensions: { ...field.extensions },
          resolve: field.resolve,
        }
        return schema
      },
    },
    db: {
      requireItemFieldSelection: true,
      extendPrismaClient: client =>
        client.$extends({
          query: {
            fieldSample: {
              $allOperations: async ({ operation, args, query }: any) => {
                strictPrismaCalls.push({ operation, args })
                return query(args)
              },
            },
          },
        }),
    },
    lists: {
      FieldSample: list({
        access: allowAll,
        fields: {
          aBigInt: bigInt(),
          aBytes: bytes(),
          aCalendarDay: calendarDay(),
          aCheckbox: checkbox(),
          ...(dbProvider === 'sqlite' ? {} : { aDecimal: decimal() }),
          aFile: file({
            storage,
            hooks: {
              afterOperation: {
                update: selectFields(
                  ({ item }) => {
                    fileHookFields = Object.keys(item)
                  },
                  { aText: true }
                ),
              },
            },
          }),
          aFloat: float(),
          anImage: image({ storage }),
          anInteger: integer(),
          aJson: json(),
          aMultiselect: multiselect({ options: ['one'] }),
          aPassword: password(),
          aSelect: select({ options: ['one'] }),
          aText: text(),
          aTimestamp: timestamp(),
          aVirtual: virtual({
            field: g.listItemField({
              select: {},
              type: g.String,
              resolve: item => item.id,
            }),
          }),
          aFileName: virtual({
            field: g.listItemField({
              select: { aFile_filename: true },
              type: g.String,
              resolve: item => item.aFile_filename,
            }),
          }),
          related: relationship({ ref: 'Related.fieldSamples' }),
        },
      }),
      Related: list({
        access: allowAll,
        fields: {
          fieldSamples: relationship({ ref: 'FieldSample.related', many: true }),
        },
      }),
      Loose: list({
        access: allowAll,
        db: { requireItemFieldSelection: false },
        fields: {
          computed: virtual({ field: g.field({ type: g.String, resolve: () => 'ok' }) }),
        },
      }),
    },
  },
})

test('strict selection starts with every built-in field type', async () => {
  const { context } = await strictSuite()
  const result = await context.graphql.run({ query: '{ fieldSamples { id } }' })
  assert.equal(JSON.stringify(result), JSON.stringify({ fieldSamples: [] }))
})

test('strict selection includes fields added to a list by a GraphQL schema extension', async () => {
  const { context } = await strictSuite()
  const item = await context.db.FieldSample.createOne({ data: { aText: 'selected' } })
  strictPrismaCalls.length = 0

  const result = await context.graphql.run({
    query: 'query ($id: ID!) { fieldSample(where: { id: $id }) { uppercaseText } }',
    variables: { id: item.id },
  })

  assert.equal(
    JSON.stringify(result),
    JSON.stringify({ fieldSample: { uppercaseText: 'SELECTED' } })
  )
  assert.deepEqual(
    strictPrismaCalls.filter(call => call.operation === 'findFirst').map(call => call.args.select),
    [{ id: true, aText: true }]
  )
})

test('item field declarations select individual Prisma columns', async () => {
  const { context } = await strictSuite()
  const item = await context.db.FieldSample.createOne({ data: { aText: 'selected' } })
  strictPrismaCalls.length = 0

  const result = await context.graphql.run({
    query: 'query ($id: ID!) { fieldSample(where: { id: $id }) { aFileName } }',
    variables: { id: item.id },
  })

  assert.equal(JSON.stringify(result), JSON.stringify({ fieldSample: { aFileName: null } }))
  assert.deepEqual(
    strictPrismaCalls.filter(call => call.operation === 'findFirst').map(call => call.args.select),
    [{ id: true, aFile_filename: true }]
  )
})

test('merged field hooks select both custom and built-in item fields', async () => {
  const { context } = await strictSuite()
  const item = await context.db.FieldSample.createOne({ data: { aText: 'selected' } })
  strictPrismaCalls.length = 0
  fileHookFields = []

  await context.db.FieldSample.updateOne({
    where: { id: String(item.id) },
    data: { aFile: null },
    select: { aText: true },
  })

  assert.deepEqual(
    new Set(fileHookFields),
    new Set(['id', 'aText', 'aFile_filename', 'aFile_filesize'])
  )
  for (const call of strictPrismaCalls.filter(
    call => call.operation === 'findFirst' || call.operation === 'update'
  )) {
    assert.deepEqual(call.args.select, {
      id: true,
      aText: true,
      aFile_filename: true,
      aFile_filesize: true,
    })
  }
})

test('strict selection rejects undeclared item requirements at startup', async () => {
  await assert.rejects(
    setupTestEnv({
      db: { requireItemFieldSelection: false },
      lists: {
        Broken: list({
          access: allowAll,
          db: { requireItemFieldSelection: true },
          fields: {
            computed: virtual({ field: g.field({ type: g.String, resolve: () => 'ok' }) }),
          },
        }),
      },
    }),
    /Broken: db\.requireItemFieldSelection needs declared item selections for fields\.computed\.output/
  )

  await assert.rejects(
    setupTestEnv({
      db: { requireItemFieldSelection: true },
      lists: {
        BrokenHook: list({
          access: allowAll,
          fields: { title: text() },
          hooks: { validate: { update: () => {} } },
        }),
      },
    }),
    /BrokenHook: db\.requireItemFieldSelection needs declared item selections for update original item/
  )
})

test('strict selection checks fields added by a GraphQL schema extension at startup', async () => {
  await assert.rejects(
    setupTestEnv({
      db: { requireItemFieldSelection: true },
      graphql: {
        extendGraphqlSchema(schema) {
          const fields = (schema.getType('Post') as any).getFields()
          fields.undeclared = {
            ...fields.title,
            name: 'undeclared',
            extensions: {},
          }
          return schema
        },
      },
      lists: {
        Post: list({
          access: allowAll,
          fields: { title: text() },
        }),
      },
    }),
    /Post: db\.requireItemFieldSelection needs declared item selections for GraphQL field Post\.undeclared/
  )
})

test('ui.itemView callbacks select their declared item fields', async () => {
  const calls: Record<string, unknown>[] = []
  const { context, connect, disconnect } = await setupTestEnv({
    db: {
      requireItemFieldSelection: true,
      extendPrismaClient: client =>
        client.$extends({
          query: {
            post: {
              findFirst: async ({ args, query }: any) => {
                calls.push(args)
                return query(args)
              },
            },
          },
        }),
    },
    lists: {
      Post: list({
        access: allowAll,
        fields: {
          title: text({
            ui: {
              itemView: {
                fieldMode: selectFields(
                  ({ item }) => (item?.status === 'draft' ? 'read' : 'edit'),
                  { status: true }
                ),
                fieldPosition: selectFields(({ item }) => (item?.extra ? 'sidebar' : 'form'), {
                  extra: true,
                }),
                isRequired: selectFields(({ item }) => Boolean(item?.title), { title: true }),
              },
            },
          }),
          status: text(),
          extra: text(),
          unused: text(),
        },
        actions: {
          publish: action({
            access: allowAll,
            ui: {
              label: 'Publish',
              itemView: {
                actionMode: selectFields(
                  ({ item }) => (item?.status === 'draft' ? 'enabled' : 'disabled'),
                  { status: true }
                ),
              },
            },
            resolve({ where }, context) {
              return context.db.Post.findOne({ where })
            },
          }),
        },
      }),
    },
  })

  await connect()
  try {
    const post = await context.db.Post.createOne({
      data: { title: 'Selected', status: 'draft', extra: 'yes', unused: 'no' },
    })
    calls.length = 0
    const result = (await context.graphql.run({
      query: `query ($id: ID!) {
        keystone {
          adminMeta {
            list(key: "Post", itemId: $id) {
              fields { key itemView { fieldMode fieldPosition isRequired } }
              actions { key itemView { actionMode } }
            }
          }
        }
      }`,
      variables: { id: post.id },
    })) as any
    const meta = result.keystone.adminMeta.list
    assert.deepEqual(
      { ...meta.fields.find((field: any) => field.key === 'title').itemView },
      { fieldMode: 'read', fieldPosition: 'sidebar', isRequired: true }
    )
    assert.equal(
      meta.actions.find((action: any) => action.key === 'publish').itemView.actionMode,
      'enabled'
    )
    assert.deepEqual(
      calls.map(call => call.select),
      [{ id: true, title: true, status: true, extra: true }]
    )
  } finally {
    await disconnect()
  }
})

test('strict selection checks ui.itemView callbacks at startup', async () => {
  await assert.rejects(
    setupTestEnv({
      db: { requireItemFieldSelection: true },
      lists: {
        Post: list({
          access: allowAll,
          fields: {
            title: text({
              ui: { itemView: { fieldMode: () => 'read' } },
            }),
          },
        }),
      },
    }),
    /Post: db\.requireItemFieldSelection needs declared item selections for fields\.title\.ui\.itemView\.fieldMode/
  )
})
