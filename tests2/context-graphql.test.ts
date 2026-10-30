import assert from 'node:assert/strict'
import { test } from 'node:test'
import { graphql, parse, type DocumentNode } from 'graphql/index.js'

import { g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { setupTestSuite } from './utils.ts'

let receivedDocument: DocumentNode['definitions'][number] | undefined
const suite = setupTestSuite({
  config: {
    lists: { TestItem: list({ access: allowAll, fields: {} }) },
    graphql: {
      extendGraphqlSchema: schema =>
        g.extend(() => ({
          query: {
            echo: g.field({
              type: g.String,
              args: { value: g.arg({ type: g.nonNull(g.String) }) },
              resolve(_source, { value }, context, info) {
                receivedDocument = info.operation
                return `${context.session?.prefix ?? ''}${value}`
              },
            }),
            fail: g.field({
              type: g.String,
              resolve() {
                throw new Error('resolver failed')
              },
            }),
            ...(schema.extensions.scope === 'internal'
              ? { hidden: g.field({ type: g.String, resolve: () => null }) }
              : {}),
          },
        }))(schema),
    },
  },
})

test('graphql.raw and run execute strings and documents with variables and context', async () => {
  const { context: baseContext } = await suite()
  const context = baseContext.withSession({ prefix: 'hello ' })
  const source = 'query ($value: String!) { echo(value: $value) }'
  const document = parse(source)

  for (const query of [source, document]) {
    const args = { query, variables: { value: 'world' } }
    assert.deepEqual(JSON.parse(JSON.stringify(await context.graphql.raw(args))), {
      data: { echo: 'hello world' },
    })
    assert.deepEqual(JSON.parse(JSON.stringify(await context.graphql.run(args))), {
      echo: 'hello world',
    })
  }
  assert.equal(receivedDocument, document.definitions[0])
})

test('graphql.raw returns request and execution errors, and run throws the first error', async () => {
  const { context } = await suite()
  for (const source of [
    '{',
    '{ missing }',
    'query ($value: String!) { echo(value: $value) }',
    '{ fail }',
  ]) {
    const expected = await graphql({
      schema: context.graphql.schema,
      source,
      contextValue: context,
    })
    const queries = source === '{' ? [source] : [source, parse(source)]
    for (const query of queries) {
      const result = await context.graphql.raw({ query })
      assert.deepEqual(JSON.parse(JSON.stringify(result)), JSON.parse(JSON.stringify(expected)))
      await assert.rejects(context.graphql.run({ query }), {
        message: expected.errors![0].message,
      })
    }
  }
})

test("reused documents use each call's variables", async () => {
  const { context } = await suite()
  const query = parse('query ($value: String!) { echo(value: $value) }')

  assert.deepEqual(
    JSON.parse(JSON.stringify(await context.graphql.run({ query, variables: { value: 'first' } }))),
    { echo: 'first' }
  )
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        await context.withSession({}).graphql.run({ query, variables: { value: 'second' } })
      )
    ),
    { echo: 'second' }
  )
  await assert.rejects(context.graphql.run({ query }), {
    message: 'Variable "$value" of required type "String!" was not provided.',
  })
})

test('reused invalid documents return matching errors', async () => {
  const { context } = await suite()
  const query = parse('{ missing }')
  const first = await context.graphql.raw({ query })
  const second = await context.withSession({}).graphql.raw({ query })
  assert.match(first.errors![0].message, /Cannot query field "missing"/)
  assert.equal(second.errors?.[0].message, first.errors?.[0].message)
})

test('documents are validated against the selected public or internal schema', async () => {
  const { context } = await suite()
  const query = parse('{ hidden }')

  assert.deepEqual(JSON.parse(JSON.stringify(await context.internal().graphql.run({ query }))), {
    hidden: null,
  })
  const result = await context.graphql.raw({ query })
  assert.match(result.errors![0].message, /Cannot query field "hidden"/)
  assert.deepEqual(JSON.parse(JSON.stringify(await context.sudo().graphql.run({ query }))), {
    hidden: null,
  })
})
