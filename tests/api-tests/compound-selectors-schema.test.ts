import { expect, test } from 'vitest'
import ts from 'typescript'
import path from 'node:path'
import { GraphQLScalarType } from 'graphql/index.js'
import { config, g, list } from '@keystone-6/core'
import { createSystem } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/artifacts'
import { allowAll } from '@keystone-6/core/access'
import {
  bigInt,
  bytes,
  calendarDay,
  password,
  relationship,
  text,
  timestamp,
} from '@keystone-6/core/fields'
import type { BaseListTypeInfo, FieldTypeFunc, ListConfig } from '@keystone-6/core/types'
import { printGeneratedTypes } from '../../packages/core/src/lib/typescript-schema-printer.ts'
import { dbProvider } from './utils.ts'

function system(lists: Record<string, ListConfig<BaseListTypeInfo>>) {
  return createSystem(
    config({ db: { provider: dbProvider, prismaClientOptions: () => ({}) }, lists })
  )
}

const fields = { a: text(), b: text() }
const unique = [{ fields: ['a', 'b'] }]

test('ordinary indexes and schema-extension strings do not create unique selectors', () => {
  const { graphql } = system({
    Test: list({
      access: allowAll,
      fields,
      db: {
        indexes: [{ fields: ['a', 'b'] }],
        extendPrismaSchema: schema => schema.replace(/}$/, '  @@unique([a, b])\n}'),
      },
    }),
  })
  expect(
    Object.keys((graphql.schemas.public.getType('TestWhereUniqueInput') as any).getFields())
  ).toEqual(['id'])
})

test('compound names cannot overwrite actual fields, including non-unique fields', () => {
  expect(() =>
    system({ Test: list({ access: allowAll, fields: { ...fields, a_b: text() }, db: { unique } }) })
  ).toThrow('compound selector "a_b" conflicts with a field or selector')
})

test('different tuples with the same underscore-joined key are rejected', () => {
  expect(() =>
    system({
      Test: list({
        access: allowAll,
        fields: { a: text(), b_c: text(), a_b: text(), c: text() },
        db: { unique: [{ fields: ['a', 'b_c'] }, { fields: ['a_b', 'c'] }] },
      }),
    })
  ).toThrow('compound selector "a_b_c" conflicts')
})

test('generated compound input names cannot collide with list output names', () => {
  expect(() =>
    system({
      Test: list({ access: allowAll, fields, db: { unique } }),
      TestWhereUniqueInput_a_b: list({ access: allowAll, fields: { value: text() } }),
    })
  ).toThrow('compound input type "TestWhereUniqueInput_a_b" conflicts')
})

test('reserved compound selector names fail clearly', () => {
  expect(() =>
    system({
      Test: list({
        access: allowAll,
        fields: { __a: text(), b: text() },
        db: { unique: [{ fields: ['__a', 'b'] }] },
      }),
    })
  ).toThrow('invalid compound selector name "__a_b"')
})

test('a stored scalar without an exact-value contract cannot participate', () => {
  expect(() =>
    system({
      Test: list({ access: allowAll, fields: { a: password(), b: text() }, db: { unique } }),
    })
  ).toThrow('field "a" must provide input.uniqueWhereValue')
})

test.each([
  g.arg({ type: g.list(g.String) }),
  g.arg({ type: g.nonNull(g.String) }),
  g.arg({ type: g.String, defaultValue: 'default' }),
  g.arg({
    type: g.inputObject({
      name: 'InvalidExactValue',
      fields: { equals: g.arg({ type: g.String }) },
    }),
  }),
])('exact-value contracts reject non-scalar inputs and defaults: %j', arg => {
  const custom: FieldTypeFunc<BaseListTypeInfo> = meta => {
    const field = text()(meta)
    return { ...field, input: { ...field.input, uniqueWhereValue: { arg } as any } }
  }
  expect(() =>
    system({ Test: list({ access: allowAll, fields: { a: custom, b: text() }, db: { unique } }) })
  ).toThrow('must provide a scalar or enum uniqueWhereValue input without a default')
})

test('existing standalone unique inputs remain a fallback only on individually unique fields', () => {
  const custom: FieldTypeFunc<BaseListTypeInfo> = meta => {
    const field = text({ isIndexed: 'unique' })(meta)
    return { ...field, input: { ...field.input, uniqueWhereValue: undefined } }
  }
  const result = system({
    Test: list({ access: allowAll, fields: { a: custom, b: text() }, db: { unique } }),
  })
  expect(
    Object.keys((result.graphql.schemas.public.getType('TestWhereUniqueInput') as any).getFields())
  ).toEqual(['a_b', 'id', 'a'])
  const invalid: FieldTypeFunc<BaseListTypeInfo> = meta => {
    const field = text()(meta)
    return { ...field, input: { ...field.input, uniqueWhere: { arg: g.arg({ type: g.String }) } } }
  }
  expect(() =>
    system({ Test: list({ access: allowAll, fields: { a: invalid, b: text() }, db: { unique } }) })
  ).toThrow(/unique/i)
})

test('generated context, relationship and cursor types accept complete tuples and reject invalid shapes', () => {
  const opaqueScalar = new GraphQLScalarType<string>({
    name: 'CompoundOpaqueString',
    parseValue(value) {
      if (typeof value !== 'string') throw new Error('Expected a string')
      return value
    },
  })
  const opaque: FieldTypeFunc<BaseListTypeInfo> = meta => {
    const field = text()(meta)
    return {
      ...field,
      input: { ...field.input, uniqueWhereValue: { arg: g.arg({ type: opaqueScalar }) } },
    }
  }
  const built = system({
    Page: list({
      access: allowAll,
      db: {
        unique: ['slug', 'day', 'at', 'large', 'binary', 'opaque'].map(key => ({
          fields: [key, 'domain'],
        })),
      },
      fields: {
        slug: text(),
        domain: text(),
        name: text(),
        day: calendarDay(),
        at: timestamp(),
        large: bigInt(),
        opaque,
        binary: bytes({ db: dbProvider === 'mysql' ? { nativeType: 'VarBinary(20)' } : {} }),
      },
    }),
    Holder: list({
      access: allowAll,
      fields: {
        page: relationship({ ref: 'Page' }),
        pages: relationship({ ref: 'Page', many: true }),
      },
    }),
  })
  const generated = printGeneratedTypes(
    './unavailable-prisma.js',
    built.graphql.schemas.internal,
    built.lists,
    dbProvider
  )
  const generatedPath = path.resolve('tests/api-tests/.compound-selector-generated.d.ts')
  const testPath = path.resolve('tests/api-tests/.compound-selector-types.ts')
  const sources = new Map([
    [generatedPath, generated],
    [
      testPath,
      `
import type { Context, PageWhereUniqueInput } from './.compound-selector-generated.js'
declare const context: Context
const where: PageWhereUniqueInput = { slug_domain: { slug: '/about', domain: 'example.com' } }
context.db.Page.findOne({ where })
context.query.Page.findOne({ where, query: 'id' })
context.db.Page.updateOne({ where, data: { name: 'updated' } })
context.query.Page.deleteOne({ where })
context.db.Page.updateMany({ data: [{ where, data: { name: 'updated' } }] })
context.query.Page.deleteMany({ where: [where] })
context.db.Page.findMany({ cursor: where })
context.query.Page.findMany({ cursor: where })
context.db.Page.findOne({ where: { day_domain: { day: '2026-09-24', domain: 'example.com' } } })
context.db.Page.findOne({ where: { at_domain: { at: new Date(), domain: 'example.com' } } })
context.query.Page.findOne({ where: { at_domain: { at: '2026-09-24T00:00:00Z', domain: 'example.com' } } })
context.db.Page.findOne({ where: { large_domain: { large: 42n, domain: 'example.com' } } })
context.db.Page.findOne({ where: { large_domain: { large: '42', domain: 'example.com' } } })
context.db.Page.findOne({ where: { binary_domain: { binary: new Uint8Array([1]), domain: 'example.com' } } })
context.db.Page.findOne({ where: { binary_domain: { binary: 'ff', domain: 'example.com' } } })
context.db.Page.findOne({ where: { opaque_domain: { opaque: 'opaque', domain: 'example.com' } } })
context.db.Holder.createOne({ data: { page: { connect: where }, pages: { connect: [where] } } })
context.query.Holder.updateOne({ where: { id: 'holder' }, data: { pages: { set: [where] } } })
context.query.Holder.updateOne({ where: { id: 'holder' }, data: { pages: { disconnect: [where] } } })
// @ts-expect-error incomplete tuple
context.db.Page.findOne({ where: { slug_domain: { slug: '/about' } } })
// @ts-expect-error null member
context.query.Page.findOne({ where: { slug_domain: { slug: '/about', domain: null } } })
// @ts-expect-error explicit null compound object
context.db.Page.findMany({ cursor: { slug_domain: null } })
// @ts-expect-error exact values, not filters
context.db.Page.deleteOne({ where: { slug_domain: { slug: { equals: '/about' }, domain: 'example.com' } } })
// @ts-expect-error member is not individually unique
context.query.Page.updateOne({ where: { slug: '/about' }, data: {} })
// @ts-expect-error relationship uses the same complete tuple contract
context.db.Holder.createOne({ data: { page: { connect: { slug_domain: { domain: 'example.com' } } } } })
// @ts-expect-error scalar type is retained
context.query.Page.findMany({ cursor: { slug_domain: { slug: 42, domain: 'example.com' } } })
// @ts-expect-error no compound selectors in general filters
context.db.Page.findMany({ where: { slug_domain: { slug: '/about', domain: 'example.com' } } })
// @ts-expect-error dates cannot be null tuple members
context.db.Page.findOne({ where: { at_domain: { at: null, domain: 'example.com' } } })
// @ts-expect-error CalendarDay is a string, not a Date
context.db.Page.findOne({ where: { day_domain: { day: new Date(), domain: 'example.com' } } })
// @ts-expect-error BigInt does not accept JavaScript numbers
context.db.Page.findOne({ where: { large_domain: { large: 42, domain: 'example.com' } } })
// @ts-expect-error bytes are not filter objects
context.db.Page.findOne({ where: { binary_domain: { binary: { equals: 'ff' }, domain: 'example.com' } } })
// @ts-expect-error opaque custom scalars are still non-null
context.db.Page.findOne({ where: { opaque_domain: { opaque: null, domain: 'example.com' } } })
`,
    ],
  ])
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    esModuleInterop: true,
  }
  const host = ts.createCompilerHost(options)
  const originalReadFile = host.readFile.bind(host)
  const originalFileExists = host.fileExists.bind(host)
  host.readFile = file => sources.get(file) ?? originalReadFile(file)
  host.fileExists = file => sources.has(file) || originalFileExists(file)
  host.getSourceFile = (file, version) => {
    const source = host.readFile(file)
    return source === undefined ? undefined : ts.createSourceFile(file, source, version, true)
  }
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([testPath], options, host))
  expect(
    ts.formatDiagnostics(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: x => x,
      getNewLine: () => '\n',
    })
  ).toBe('')
})
