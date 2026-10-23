import { beforeEach, expect, test } from 'vitest'
import { list, g } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import {
  bigInt,
  bytes,
  calendarDay,
  checkbox,
  decimal,
  float,
  integer,
  relationship,
  select,
  text,
  timestamp,
} from '@keystone-6/core/fields'
import { fieldType, type FieldTypeFunc, type BaseListTypeInfo } from '@keystone-6/core/types'
import { setupTestRunner } from './test-runner.ts'
import { dbProvider } from './utils.ts'

let mutationCalls = 0
beforeEach(() => {
  mutationCalls = 0
})

const encodedText: FieldTypeFunc<BaseListTypeInfo> = meta => {
  const field = text()(meta)
  return fieldType({ kind: 'scalar', scalar: 'String', mode: 'required' })({
    ...field,
    input: {
      where: field.input!.where,
      uniqueWhereValue: {
        arg: g.arg({ type: g.String }),
        resolve(value: string) {
          if (value === 'invalid') return { contains: '' } as any
          if (value === 'null') return null as any
          return value.replace(/^key:/, '')
        },
      },
      create: {
        arg: g.arg({ type: g.String }),
        resolve(value: string | null | undefined) {
          mutationCalls++
          return value ?? ''
        },
      },
      update: {
        arg: g.arg({ type: g.String }),
        resolve(value) {
          mutationCalls++
          return value ?? undefined
        },
      },
    },
  })
}

const scalarFields = {
  day: calendarDay(),
  at: timestamp(),
  status: select({ type: 'enum', options: ['draft', 'live'] }),
  statusText: select({ type: 'string', options: ['draft', 'live'] }),
  statusNumber: select({
    type: 'integer',
    options: [
      { label: 'one', value: 1 },
      { label: 'two', value: 2 },
    ],
  }),
  flag: checkbox(),
  count: integer(),
  fraction: float(),
  large: bigInt(),
  binary: bytes({ db: dbProvider === 'mysql' ? { nativeType: 'VarBinary(20)' } : {} }),
  ...(dbProvider === 'sqlite' ? {} : { amount: decimal() }),
}

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      Page: list({
        access: {
          operation: {
            query: ({ session }) => !session?.denyQuery,
            create: allowAll,
            update: ({ session }) => !session?.denyUpdate,
            delete: ({ session }) => !session?.denyDelete,
          },
          filter: {
            query: ({ session }) =>
              session?.queryDomain ? { domain: { equals: session.queryDomain } } : true,
            update: ({ session }) =>
              session?.updateDomain ? { domain: { equals: session.updateDomain } } : true,
            delete: ({ session }) =>
              session?.deleteDomain ? { domain: { equals: session.deleteDomain } } : true,
          },
        },
        db: {
          map: 'pages_table',
          unique: [{ fields: ['slug', 'domain'] }, { fields: ['domain', 'slug'] }],
        },
        fields: {
          slug: text({
            db: { map: 'path_column' },
            access: {
              read: {
                item: allowAll,
                order: allowAll,
                filter: ({ session }) => !session?.denySlug,
              },
            },
          }),
          domain: text({
            db: { isNullable: true, map: 'host_column' },
            access: {
              read: {
                item: allowAll,
                order: allowAll,
                filter: ({ session }) => !session?.denyDomain,
              },
            },
          }),
          name: text(),
          order: integer(),
          external: text({ isIndexed: 'unique', db: { isNullable: true } }),
          profile: relationship({ ref: 'Profile.page' }),
        },
      }),
      Profile: list({
        access: allowAll,
        fields: {
          name: text(),
          page: relationship({ ref: 'Page.profile', db: { foreignKey: true } }),
        },
      }),
      Holder: list({
        access: allowAll,
        fields: {
          name: text(),
          page: relationship({ ref: 'Page' }),
          pages: relationship({ ref: 'Page', many: true }),
          converted: relationship({ ref: 'Converted', many: true }),
          profiles: relationship({ ref: 'Profile', many: true }),
        },
      }),
      Hidden: list({
        access: allowAll,
        db: { unique: [{ fields: ['key', 'scope'] }] },
        fields: {
          key: text(),
          scope: text({ graphql: { omit: { read: { item: false, filter: true, order: false } } } }),
        },
      }),
      Converted: list({
        access: allowAll,
        db: { unique: [{ fields: ['key', 'scope'] }] },
        fields: { key: encodedText, scope: text(), order: integer() },
      }),
      ScalarIdentity: list({
        access: allowAll,
        db: { unique: Object.keys(scalarFields).map(key => ({ fields: [key, 'scope'] })) },
        fields: { scope: text(), ...scalarFields },
      }),
      Translation: list({
        access: allowAll,
        db: { unique: [{ fields: ['key', 'locale', 'channel'] }] },
        fields: {
          key: text(),
          locale: text(),
          channel: select({ type: 'enum', options: ['web', 'mobile'] }),
        },
      }),
    },
  },
})

const where = (slug: string, domain: string) => ({ slug_domain: { slug, domain } })

test(
  'schema adds complete tuple inputs in declaration order, not standalone members or ordinary filters',
  runner(async ({ context, artifacts }) => {
    const schema = context.graphql.schema
    const unique = schema.getType('PageWhereUniqueInput') as any
    expect(Object.keys(unique.getFields())).toEqual([
      'slug_domain',
      'domain_slug',
      'id',
      'external',
      'profile',
    ])
    const tuple = schema.getType('PageWhereUniqueInput_slug_domain') as any
    expect(
      Object.entries(tuple.getFields()).map(([key, value]: [string, any]) => [
        key,
        String(value.type),
      ])
    ).toEqual([
      ['slug', 'String!'],
      ['domain', 'String!'],
    ])
    expect((schema.getType('PageWhereInput') as any).getFields().slug_domain).toBeUndefined()
    expect((schema.getType('Page') as any).getFields().slug_domain).toBeUndefined()
    expect(artifacts.prisma).toContain('@@unique([slug, domain])')
    expect(artifacts.prisma).not.toMatch(/slug\s+String[^\n]*@unique/)
    expect(context.__internal.lists.Page.compoundUnique.slug_domain).toMatchObject({
      fields: ['slug', 'domain'],
      nullableFields: ['domain'],
      prismaKey: 'slug_domain',
      graphqlName: 'slug_domain',
    })
  })
)

test.each(['db', 'query'] as const)(
  '%s finds complete tuples and retains not-found and multiple-selector behavior',
  api =>
    runner(async ({ context }) => {
      const items = await createPages(context)
      const item = await context[api].Page.findOne({ where: where('/about', 'b.example') })
      expect(item?.id).toBe(items[1].id)
      expect(await context[api].Page.findOne({ where: where('/missing', 'b.example') })).toBeNull()
      expect(
        (
          await context[api].Page.findOne({
            where: { id: items[1].id, ...where('/about', 'b.example') },
          })
        )?.id
      ).toBe(items[1].id)
      expect(
        await context[api].Page.findOne({
          where: { id: items[0].id, ...where('/about', 'b.example') },
        })
      ).toBeNull()
      expect(
        await context[api].Page.findOne({
          where: {
            ...where('/about', 'a.example'),
            domain_slug: { slug: '/contact', domain: 'a.example' },
          },
        })
      ).toBeNull()
      expect((await context[api].Page.findOne({ where: { external: 'external-a' } }))?.id).toBe(
        items[0].id
      )
    })()
)

async function createPages(context: any) {
  return Promise.all(
    [
      { slug: '/about', domain: 'a.example', name: 'A', order: 1, external: 'external-a' },
      { slug: '/about', domain: 'b.example', name: 'B', order: 2 },
      { slug: '/contact', domain: 'a.example', name: 'C', order: 3 },
    ].map(data => context.prisma.page.create({ data }))
  )
}

test(
  'GraphQL lookup, update and delete target only the complete tuple',
  runner(async ({ context, gql }) => {
    const items = await createPages(context)
    const variables = { where: where('/about', 'b.example') }
    const found = await gql({
      query: 'query ($where: PageWhereUniqueInput!) { page(where: $where) { id name } }',
      variables,
    })
    expect(found.errors).toBeUndefined()
    expect(found.data.page).toEqual({ id: items[1].id, name: 'B' })
    const updated = await gql({
      query:
        'mutation ($where: PageWhereUniqueInput!) { updatePage(where: $where, data: { name: "updated" }) { id } }',
      variables,
    })
    expect(updated.errors).toBeUndefined()
    expect(updated.data.updatePage.id).toBe(items[1].id)
    const deleted = await gql({
      query: 'mutation ($where: PageWhereUniqueInput!) { deletePage(where: $where) { id } }',
      variables,
    })
    expect(deleted.errors).toBeUndefined()
    expect(deleted.data.deletePage.id).toBe(items[1].id)
    expect(await context.prisma.page.findMany({ orderBy: { order: 'asc' } })).toMatchObject([
      { name: 'A' },
      { name: 'C' },
    ])
  })
)

test.each(['db', 'query'] as const)('%s accepts compound selectors in bulk update/delete', api =>
  runner(async ({ context }) => {
    const items = await createPages(context)
    const selectors = [where('/about', 'a.example'), where('/contact', 'a.example')]
    const updated = await context[api].Page.updateMany({
      data: selectors.map(where => ({ where, data: { name: 'updated' } })),
    })
    expect(updated.map(item => item.id).sort()).toEqual([items[0].id, items[2].id].sort())
    const deleted = await context[api].Page.deleteMany({ where: selectors })
    expect(deleted.map(item => item.id).sort()).toEqual([items[0].id, items[2].id].sort())
    expect(await context.prisma.page.findMany()).toMatchObject([{ id: items[1].id, name: 'B' }])
  })()
)

test.each([
  {},
  { slug: '/about' },
  { slug: '/about', domain: null },
  { slug: null, domain: 'a.example' },
  { slug: { equals: '/about' }, domain: 'a.example' },
])('incomplete, null or filter-valued tuple is rejected: %j', tuple =>
  runner(async ({ context, gql }) => {
    const result = await gql({
      query: 'query ($where: PageWhereUniqueInput!) { page(where: $where) { id } }',
      variables: { where: { slug_domain: tuple } },
    })
    expect(result.errors?.length).toBeGreaterThan(0)
    await expect(context.db.Page.findOne({ where: { slug_domain: tuple } })).rejects.toThrow()
  })()
)

test(
  'null compound objects are rejected and null-containing database tuples remain unaddressable',
  runner(async ({ context }) => {
    await context.prisma.page.create({ data: { slug: '/null', domain: null } })
    await context.prisma.page.create({ data: { slug: '/null', domain: null } })
    expect(await context.prisma.page.count()).toBe(2)
    await expect(context.db.Page.findOne({ where: { slug_domain: null } })).rejects.toMatchObject({
      extensions: { code: 'KS_USER_INPUT_ERROR' },
    })
    await expect(context.db.Page.findMany({ cursor: { slug_domain: null } })).rejects.toMatchObject(
      { extensions: { code: 'KS_USER_INPUT_ERROR' } }
    )
  })
)

test(
  'three-member enum tuples retain all members',
  runner(async ({ context }) => {
    const a = await context.prisma.translation.create({
      data: { key: 'title', locale: 'en', channel: 'web' },
    })
    await context.prisma.translation.create({
      data: { key: 'title', locale: 'en', channel: 'mobile' },
    })
    expect(
      (
        await context.db.Translation.findOne({
          where: { key_locale_channel: { key: 'title', locale: 'en', channel: 'web' } },
        })
      )?.id
    ).toBe(a.id)
  })
)

test(
  'connect, set, disconnect and nested create combinations accept compound selectors',
  runner(async ({ context }) => {
    const items = await createPages(context)
    const holder = await context.query.Holder.createOne({
      data: {
        page: { connect: where('/about', 'a.example') },
        pages: {
          connect: [where('/about', 'b.example')],
          create: [{ slug: '/nested', domain: 'a.example' }],
        },
      },
      query: 'id page { id } pages { slug }',
    })
    expect(holder.page.id).toBe(items[0].id)
    expect(holder.pages.map((x: any) => x.slug).sort()).toEqual(['/about', '/nested'])
    await context.db.Holder.updateOne({
      where: { id: holder.id },
      data: { pages: { set: [where('/about', 'a.example'), where('/contact', 'a.example')] } },
    })
    await context.db.Holder.updateOne({
      where: { id: holder.id },
      data: {
        pages: {
          disconnect: [where('/about', 'a.example')],
          connect: [where('/about', 'b.example')],
        },
        page: { disconnect: true },
      },
    })
    const result = await context.query.Holder.findOne({
      where: { id: holder.id },
      query: 'page { id } pages(orderBy: { order: asc }) { id }',
    })
    expect(result).toEqual({ page: null, pages: [{ id: items[1].id }, { id: items[2].id }] })
  })
)

test(
  'one-to-one selectors can contain compound identities without leaking their Prisma keys into filters',
  runner(async ({ context }) => {
    const items = await createPages(context)
    const profile = await context.query.Profile.createOne({
      data: { name: 'profile', page: { connect: where('/about', 'a.example') } },
    })
    const selector = { page: where('/about', 'a.example') }
    expect((await context.db.Profile.findOne({ where: selector }))?.id).toBe(profile.id)
    expect((await context.db.Page.findOne({ where: { profile: { id: profile.id } } }))?.id).toBe(
      items[0].id
    )
    const holder = await context.query.Holder.createOne({
      data: { profiles: { connect: [selector] } },
      query: 'profiles { id }',
    })
    expect(holder.profiles).toEqual([{ id: profile.id }])
    expect(await context.query.Profile.findMany({ cursor: selector, take: 1 })).toEqual([
      { id: profile.id },
    ])
  })
)

test.each(['db', 'query'] as const)('%s cursor pagination resolves complete compound tuples', api =>
  runner(async ({ context }) => {
    const items = await createPages(context)
    expect(
      await context[api].Page.findMany({
        cursor: where('/about', 'b.example'),
        orderBy: { order: 'asc' },
        skip: 1,
      })
    ).toMatchObject([{ id: items[2].id }])
  })()
)

test(
  'GraphQL and relationship cursor arguments use the same compound inputs',
  runner(async ({ context, gql }) => {
    const items = await createPages(context)
    const holder = await context.query.Holder.createOne({
      data: { pages: { connect: items.map(item => ({ id: item.id })) } },
    })
    const result = await gql({
      query:
        'query ($cursor: PageWhereUniqueInput!, $id: ID!) { pages(cursor: $cursor, orderBy: { order: asc }, skip: 1) { id } holder(where: { id: $id }) { pages(cursor: $cursor, orderBy: { order: asc }, skip: 1) { id } } }',
      variables: { cursor: where('/about', 'b.example'), id: holder.id },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data).toEqual({
      pages: [{ id: items[2].id }],
      holder: { pages: [{ id: items[2].id }] },
    })
  })
)

test(
  'custom value conversion is used for lookups, mutations, relationships and cursors, never mutation resolvers',
  runner(async ({ context }) => {
    const item = await context.prisma.converted.create({
      data: { key: 'alpha', scope: 'scope', order: 1 },
    })
    const second = await context.prisma.converted.create({
      data: { key: 'beta', scope: 'scope', order: 2 },
    })
    const selector = { key_scope: { key: 'key:alpha', scope: 'scope' } }
    expect((await context.db.Converted.findOne({ where: selector }))?.id).toBe(item.id)
    const holder = await context.query.Holder.createOne({
      data: { converted: { connect: [selector] } },
      query: 'converted { id }',
    })
    expect(holder.converted).toEqual([{ id: item.id }])
    expect(
      await context.db.Converted.findMany({ cursor: selector, orderBy: { order: 'asc' }, skip: 1 })
    ).toMatchObject([{ id: second.id }])
    expect(mutationCalls).toBe(0)
    await context.db.Converted.deleteOne({ where: selector })
    expect(mutationCalls).toBe(0)
  })
)

test.each(['denySlug', 'denyDomain'])('member filtering access cannot be bypassed: %s', flag =>
  runner(async ({ context }) => {
    const items = await createPages(context)
    for (const denied of [
      context.withSession({ [flag]: true }),
      context.internal().withSession({ [flag]: true }),
    ]) {
      const selector = where('/about', 'a.example')
      await expect(denied.db.Page.findOne({ where: selector })).rejects.toThrow(/filter/)
      await expect(denied.db.Page.findMany({ cursor: selector })).rejects.toThrow(/filter/)
      await expect(
        denied.db.Page.updateOne({ where: selector, data: { name: 'denied' } })
      ).rejects.toThrow(/filter/)
      await expect(denied.db.Page.deleteOne({ where: selector })).rejects.toThrow(/filter/)
      await expect(
        denied.db.Holder.createOne({ data: { page: { connect: selector } } })
      ).rejects.toThrow(/Access denied/)
      expect((await denied.sudo().db.Page.findOne({ where: selector }))?.id).toBe(items[0].id)
    }
    expect(await context.prisma.page.count()).toBe(3)
  })()
)

test(
  'list operation and row filters still govern compound lookups and writes',
  runner(async ({ context }) => {
    const items = await createPages(context)
    const selector = where('/about', 'b.example')
    expect(
      await context.withSession({ denyQuery: true }).db.Page.findOne({ where: selector })
    ).toBeNull()
    expect(
      await context.withSession({ queryDomain: 'a.example' }).db.Page.findOne({ where: selector })
    ).toBeNull()
    for (const session of [{ denyUpdate: true }, { updateDomain: 'a.example' }]) {
      await expect(
        context
          .withSession(session)
          .db.Page.updateOne({ where: selector, data: { name: 'denied' } })
      ).rejects.toMatchObject({ extensions: { code: 'KS_ACCESS_DENIED' } })
    }
    for (const session of [{ denyDelete: true }, { deleteDomain: 'a.example' }]) {
      await expect(
        context.withSession(session).db.Page.deleteOne({ where: selector })
      ).rejects.toMatchObject({ extensions: { code: 'KS_ACCESS_DENIED' } })
    }
    const denied = context.withSession({ queryDomain: 'a.example' })
    const errors = []
    for (const target of [selector, where('/missing', 'b.example')]) {
      try {
        await denied.db.Holder.createOne({ data: { page: { connect: target } } })
      } catch (error) {
        errors.push(error)
      }
    }
    expect(errors).toHaveLength(2)
    expect((errors[0] as Error).message).toBe((errors[1] as Error).message)
    expect(await context.prisma.page.findUnique({ where: { id: items[1].id } })).toMatchObject({
      name: 'B',
    })
  })
)

test(
  'public omission removes the whole tuple; internal restores it without changing ordinary filters',
  runner(async ({ context }) => {
    const internal = context.internal()
    const publicFields = (
      context.graphql.schema.getType('HiddenWhereUniqueInput') as any
    ).getFields()
    expect(Object.keys(publicFields)).toEqual(['id'])
    expect(
      (internal.graphql.schema.getType('HiddenWhereUniqueInput') as any).getFields().key_scope
    ).toBeDefined()
    const item = await context.prisma.hidden.create({ data: { key: 'key', scope: 'scope' } })
    const selector = { key_scope: { key: 'key', scope: 'scope' } }
    await expect(context.db.Hidden.findOne({ where: selector })).rejects.toThrow(/key_scope/)
    expect((await internal.db.Hidden.findOne({ where: selector }))?.id).toBe(item.id)
    expect(
      (internal.graphql.schema.getType('HiddenWhereInput') as any).getFields().key_scope
    ).toBeUndefined()
  })
)

const scalarValues: Record<string, unknown> = {
  day: '2026-09-24',
  at: '2026-09-24T12:30:00.000Z',
  status: 'live',
  statusText: 'live',
  statusNumber: 2,
  flag: true,
  count: 42,
  fraction: 1.25,
  large: '9007199254740993',
  binary: Buffer.from('identity').toString('hex'),
  ...(dbProvider === 'sqlite' ? {} : { amount: '12.34' }),
}
test.each(Object.keys(scalarFields))('exact values preserve the %s field contract', field =>
  runner(async ({ context }) => {
    const item = await context.query.ScalarIdentity.createOne({
      data: { scope: 'scope', [field]: scalarValues[field] },
    })
    const selector = { [`${field}_scope`]: { [field]: scalarValues[field], scope: 'scope' } }
    expect((await context.db.ScalarIdentity.findOne({ where: selector }))?.id).toBe(item.id)
    expect(await context.query.ScalarIdentity.findMany({ cursor: selector, take: 1 })).toEqual([
      { id: item.id },
    ])
    await context.db.ScalarIdentity.updateOne({ where: selector, data: { scope: 'updated' } })
    await context.db.ScalarIdentity.deleteOne({
      where: { [`${field}_scope`]: { [field]: scalarValues[field], scope: 'updated' } },
    })
    expect(await context.prisma.scalarIdentity.count()).toBe(0)
  })()
)

test.each(['invalid', 'null'])('custom resolver cannot return a filter or null: %s', key =>
  runner(async ({ context }) => {
    await expect(
      context.db.Converted.findOne({ where: { key_scope: { key, scope: 'scope' } } })
    ).rejects.toMatchObject({ extensions: { code: 'KS_USER_INPUT_ERROR' } })
  })()
)
