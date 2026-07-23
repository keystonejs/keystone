import { config, list } from '@keystone-6/core'
import { createSystem } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import assert from 'node:assert/strict'
import { test } from 'node:test'

function makeList(graphql?: Parameters<typeof list>[0]['graphql']) {
  return list({
    access: allowAll,
    fields: {
      name: text(),
    },
    graphql,
  })
}

test('listDefaults are normalized and inherited by lists', () => {
  const resolved = config({
    db: {
      provider: 'sqlite',
      url: 'file:./test.db',
    },
    listDefaults: {
      graphql: {
        omit: {
          query: true,
          create: true,
        },
        maxTake: 10,
      },
    },
    lists: {
      Inherited: makeList(),
      PartialOverride: makeList({
        omit: {
          query: false,
          create: undefined,
        },
        maxTake: undefined,
      }),
      Replaced: makeList({
        omit: false,
        maxTake: Infinity,
      }),
    },
  })

  assert.deepEqual(resolved.listDefaults, {
    graphql: {
      omit: {
        query: true,
        create: true,
      },
      maxTake: 10,
    },
  })
  assert.deepEqual(resolved.lists.Inherited.graphql, {
    omit: {
      query: true,
      create: true,
    },
    maxTake: 10,
  })
  assert.deepEqual(resolved.lists.PartialOverride.graphql, {
    omit: {
      query: false,
      create: true,
      update: undefined,
      delete: undefined,
    },
    maxTake: 10,
  })
  assert.deepEqual(resolved.lists.Replaced.graphql, {
    omit: false,
    maxTake: Infinity,
  })

  const booleanDefaults = config({
    db: {
      provider: 'sqlite',
      url: 'file:./test.db',
    },
    listDefaults: {
      graphql: {
        omit: true,
      },
    },
    lists: {
      Override: makeList({
        omit: {
          query: false,
        },
      }),
    },
  })
  assert.deepEqual(booleanDefaults.lists.Override.graphql.omit, {
    query: false,
    create: true,
    update: true,
    delete: true,
  })

  const system = createSystem(resolved)
  const queryFields = system.graphql.schemas.public.getQueryType()!.getFields()
  const inheritedQueryName = system.lists.Inherited.graphql.names.listQueryName
  const partialQueryName = system.lists.PartialOverride.graphql.names.listQueryName
  const replacedQueryName = system.lists.Replaced.graphql.names.listQueryName

  assert.equal(queryFields[inheritedQueryName], undefined)
  assert.equal(
    queryFields[partialQueryName].args.find(arg => arg.name === 'take')!.defaultValue,
    10
  )
  assert.equal(
    queryFields[replacedQueryName].args.find(arg => arg.name === 'take')!.defaultValue,
    undefined
  )
})

test('listDefaults are present when omitted', () => {
  const resolved = config({
    db: {
      provider: 'sqlite',
      url: 'file:./test.db',
    },
    lists: {},
  })

  assert.deepEqual(resolved.listDefaults, { graphql: {} })
})
