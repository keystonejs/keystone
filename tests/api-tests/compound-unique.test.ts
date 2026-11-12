import { expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, select, text } from '@keystone-6/core/fields'
import { setupTestRunner } from './test-runner.ts'

const runner = setupTestRunner({
  serve: true,
  config: {
    graphql: { debug: false },
    lists: {
      Inventory: list({
        access: allowAll,
        db: {
          map: 'inventory_table',
          indexes: [{ fields: ['location', 'quantity'] }],
          unique: [{ fields: ['sku', 'location'] }],
        },
        fields: {
          sku: text({ isIndexed: true, db: { map: 'sku_column' } }),
          location: text({ db: { map: 'location_column' } }),
          quantity: integer(),
          barcode: text({ isIndexed: 'unique', db: { isNullable: true } }),
        },
      }),
      Translation: list({
        access: allowAll,
        db: {
          unique: [{ fields: ['key', 'locale', 'channel'] }, { fields: ['alias', 'channel'] }],
        },
        fields: {
          key: text(),
          locale: text(),
          alias: text({ db: { isNullable: true } }),
          channel: select({ type: 'enum', options: ['web', 'mobile'], db: { isNullable: false } }),
        },
      }),
      Nullable: list({
        access: allowAll,
        db: {
          indexes: [{ fields: ['scope', 'code'] }],
          unique: [{ fields: ['code', 'scope'] }],
        },
        fields: {
          code: text({ db: { isNullable: true } }),
          scope: text({ db: { isNullable: true } }),
        },
      }),
    },
  },
})

test(
  'database rejects complete duplicate tuples but allows either member to be shared',
  runner(async ({ context }) => {
    await context.prisma.inventory.create({ data: { sku: 'A', location: 'north' } })
    await context.prisma.inventory.create({ data: { sku: 'A', location: 'south' } })
    await context.prisma.inventory.create({ data: { sku: 'B', location: 'north' } })
    await expect(
      context.prisma.inventory.create({ data: { sku: 'A', location: 'north' } })
    ).rejects.toMatchObject({ code: 'P2002' })
    expect(await context.prisma.inventory.count()).toBe(3)
  })
)

test(
  'database rejects update collisions, including through Keystone mutations',
  runner(async ({ context, gql }) => {
    await context.prisma.inventory.create({ data: { sku: 'A', location: 'north' } })
    const item = await context.prisma.inventory.create({ data: { sku: 'A', location: 'south' } })
    await expect(
      context.prisma.inventory.update({ where: { id: item.id }, data: { location: 'north' } })
    ).rejects.toMatchObject({ code: 'P2002' })
    const result = await gql({
      query:
        'mutation ($id: ID!) { updateInventory(where: { id: $id }, data: { location: "north" }) { id } }',
      variables: { id: item.id },
    })
    expect(result.data).toEqual({ updateInventory: null })
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({
      message: 'Prisma error',
      extensions: { code: 'KS_PRISMA_ERROR' },
    })
    expect(await context.prisma.inventory.findUnique({ where: { id: item.id } })).toMatchObject({
      location: 'south',
    })
  })
)

test(
  'three-field constraints enforce the whole tuple, including enum fields',
  runner(async ({ context }) => {
    const data = { key: 'title', locale: 'en', channel: 'web' }
    await context.prisma.translation.create({ data })
    for (const change of [{ key: 'summary' }, { locale: 'de' }, { channel: 'mobile' }]) {
      await context.prisma.translation.create({ data: { ...data, ...change } })
    }
    await expect(context.prisma.translation.create({ data })).rejects.toMatchObject({
      code: 'P2002',
    })
    expect(await context.prisma.translation.count()).toBe(4)
  })
)

test(
  'nullable compound constraints allow repeated null-containing tuples',
  runner(async ({ context }) => {
    for (const data of [
      { code: 'A', scope: null },
      { code: null, scope: 'north' },
      { code: null, scope: null },
    ]) {
      await context.prisma.nullable.create({ data })
      await context.prisma.nullable.create({ data })
    }
    await context.prisma.nullable.create({ data: { code: 'A', scope: 'north' } })
    await expect(
      context.prisma.nullable.create({ data: { code: 'A', scope: 'north' } })
    ).rejects.toMatchObject({ code: 'P2002' })
    expect(await context.prisma.nullable.count()).toBe(7)
  })
)

test(
  'multiple constraints on one list enforce independent scopes',
  runner(async ({ context }) => {
    await context.prisma.translation.create({
      data: { key: 'title', locale: 'en', channel: 'web', alias: 'heading' },
    })
    // A different locale satisfies the first constraint but must still satisfy alias/channel.
    await expect(
      context.prisma.translation.create({
        data: { key: 'title', locale: 'de', channel: 'web', alias: 'heading' },
      })
    ).rejects.toMatchObject({ code: 'P2002' })
    await context.prisma.translation.create({
      data: { key: 'title', locale: 'de', channel: 'mobile', alias: 'heading' },
    })
    expect(await context.prisma.translation.count()).toBe(2)
  })
)

test(
  'concurrent inserts cannot create duplicate complete tuples',
  runner(async ({ context }) => {
    const results = await Promise.allSettled([
      context.prisma.inventory.create({ data: { sku: 'A', location: 'north' } }),
      context.prisma.inventory.create({ data: { sku: 'A', location: 'north' } }),
    ])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter(result => result.status === 'rejected')).toEqual([
      { status: 'rejected', reason: expect.objectContaining({ code: 'P2002' }) },
    ])
    expect(await context.prisma.inventory.count()).toBe(1)
  })
)

test(
  'GraphQL keeps existing selectors and Prisma-error masking on create',
  runner(async ({ context, gql }) => {
    const result = await gql({
      query: '{ __type(name: "InventoryWhereUniqueInput") { inputFields { name } } }',
    })
    expect(result.errors).toBeUndefined()
    expect(
      result.data.__type.inputFields.map((field: { name: string }) => field.name).sort()
    ).toEqual(['barcode', 'id'])

    const mutation = 'mutation { createInventory(data: { sku: "A", location: "north" }) { id } }'
    const created = await gql({ query: mutation })
    expect(created.errors).toBeUndefined()
    const duplicate = await gql({ query: mutation })
    expect(duplicate.data).toEqual({ createInventory: null })
    expect(duplicate.errors).toHaveLength(1)
    expect(duplicate.errors[0]).toMatchObject({
      message: 'Prisma error',
      extensions: { code: 'KS_PRISMA_ERROR' },
    })

    await context.prisma.inventory.create({ data: { sku: 'B', location: 'north', barcode: 'one' } })
    await expect(
      context.prisma.inventory.create({ data: { sku: 'C', location: 'north', barcode: 'one' } })
    ).rejects.toMatchObject({ code: 'P2002' })
  })
)
