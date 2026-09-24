import { describe, expect, test } from 'vitest'
import type { DatabaseProvider, ListDBConfig } from '@keystone-6/core/types'
import type { ResolvedDBField } from '../../packages/core/src/lib/core/resolve-relationships.ts'
import { resolveDatabaseIndexes } from '../../packages/core/src/lib/core/database-indexes.ts'

const scalar = { kind: 'scalar', scalar: 'String', mode: 'required' } as const
const fields: Record<string, ResolvedDBField> = {
  id: scalar,
  a: scalar,
  b: { ...scalar, mode: 'optional', map: 'b_column' },
  c: { kind: 'enum', name: 'Status', values: ['open', 'closed'], mode: 'required' },
}

for (const provider of ['sqlite', 'postgresql', 'mysql'] as const) {
  describe(provider, () => {
    test('normalizes in declaration order without mutating configuration or sorting fields', () => {
      const db = Object.freeze({
        indexes: Object.freeze([
          { fields: Object.freeze(['a', 'b']) },
          { fields: Object.freeze(['b', 'a']) },
        ]),
        unique: Object.freeze([
          { fields: Object.freeze(['a', 'b', 'c']) },
          { fields: Object.freeze(['b', 'a', 'c']) },
        ]),
      })
      expect(resolveDatabaseIndexes('Test', provider, db, fields)).toEqual([
        { kind: 'index', fields: ['a', 'b'] },
        { kind: 'index', fields: ['b', 'a'] },
        { kind: 'unique', fields: ['a', 'b', 'c'] },
        { kind: 'unique', fields: ['b', 'a', 'c'] },
      ])
      expect(resolveDatabaseIndexes('Test', provider, {}, fields)).toEqual([])
      expect(resolveDatabaseIndexes('Test', provider, { indexes: [], unique: [] }, fields)).toEqual(
        []
      )
    })

    for (const option of ['indexes', 'unique'] as const) {
      test.each([
        [null, 'expected an array'],
        [{ fields: ['a', 'b'] }, 'expected an array'],
        [[null], 'expected { fields: [...] }'],
        [[{}], 'expected { fields: [...] }'],
        [[['a', 'b']], 'expected { fields: [...] }'],
        [[{ fields: 'a' }], 'expected { fields: [...] }'],
        [[{ fields: [] }], 'expected at least'],
        [[{ fields: ['a', 'a'] }], 'repeated field "a"'],
        [[{ fields: ['a', 'missing'] }], 'unknown field "missing"'],
        [[{ fields: ['a', 'b_column'] }], 'unknown field "b_column"'],
        [[{ fields: ['a', 'toString'] }], 'unknown field "toString"'],
        [[{ fields: ['a', ''] }], 'fields must be non-empty field key strings'],
        [[{ fields: ['a', 1] }], 'fields must be non-empty field key strings'],
        [[{ fields: ['a', 'b'], map: 'custom' }], 'only "fields" is supported'],
        [[{ fields: ['a', 'b'], name: 'custom' }], 'only "fields" is supported'],
        [[{ fields: ['a', 'b'] }, { fields: ['a', 'b'] }], `duplicates Test.db.${option}[0]`],
      ])(`${option} rejects invalid declaration %j`, (declarations, message) => {
        const db = { [option]: declarations } as ListDBConfig
        expect(() => resolveDatabaseIndexes('Test', provider, db, fields)).toThrow(
          `Test.db.${option}`
        )
        expect(() => resolveDatabaseIndexes('Test', provider, db, fields)).toThrow(message)
      })

      test.each([
        { kind: 'none' },
        { kind: 'multi', fields: { value: scalar } },
        { ...scalar, mode: 'many' },
        { ...fields.c, mode: 'many' },
        { kind: 'relation', mode: 'many', list: 'Other', field: 'back', relationName: 'Test' },
        ...(['none', 'owned', 'owned-unique'] as const).map(kind => ({
          kind: 'relation',
          mode: 'one',
          list: 'Other',
          field: 'back',
          foreignIdField: { kind, map: 'fk' },
        })),
      ] as ResolvedDBField[])(`${option} rejects unsupported database shapes: %j`, field => {
        expect(() =>
          resolveDatabaseIndexes(
            'Test',
            provider,
            { [option]: [{ fields: ['a', 'unsupported'] }] },
            {
              ...fields,
              unsupported: field,
            }
          )
        ).toThrow('field "unsupported" must store a single scalar or enum value')
      })

      test(`${option} rejects JSON even though it is a scalar`, () => {
        expect(() =>
          resolveDatabaseIndexes(
            'Test',
            provider,
            { [option]: [{ fields: ['a', 'json'] }] },
            {
              ...fields,
              json: { kind: 'scalar', scalar: 'Json', mode: 'optional' },
            }
          )
        ).toThrow('Json field "json" is not supported')
      })
    }

    test('requires compound unique declarations; existing field indexes remain separate', () => {
      expect(() =>
        resolveDatabaseIndexes('Test', provider, { unique: [{ fields: ['a'] }] }, fields)
      ).toThrow("use field-level isIndexed: 'unique'")
      for (const indexed of [
        fields,
        { ...fields, a: { ...scalar, index: 'index' } },
        { ...fields, a: { ...scalar, index: 'unique' } },
      ] as Record<string, ResolvedDBField>[]) {
        const field = indexed === fields ? 'id' : 'a'
        expect(() =>
          resolveDatabaseIndexes('Test', provider, { indexes: [{ fields: [field] }] }, indexed)
        ).toThrow(`field "${field}" is already indexed`)
        expect(
          resolveDatabaseIndexes(
            'Test',
            provider,
            { indexes: [{ fields: ['a', 'b'] }], unique: [{ fields: ['a', 'b'] }] },
            indexed
          )
        ).toHaveLength(2)
      }
    })
  })
}

test.each([
  ['mysql', { ...scalar, nativeType: 'Text' }],
  ['mysql', { ...scalar, nativeType: 'TinyText' }],
  ['mysql', { ...scalar, nativeType: 'MediumText' }],
  ['mysql', { ...scalar, nativeType: 'LongText' }],
  ['mysql', { ...scalar, scalar: 'Bytes' }],
  ['mysql', { ...scalar, scalar: 'Bytes', nativeType: 'Blob' }],
  ['mysql', { ...scalar, scalar: 'Bytes', nativeType: 'TinyBlob' }],
  ['mysql', { ...scalar, scalar: 'Bytes', nativeType: 'MediumBlob' }],
  ['mysql', { ...scalar, scalar: 'Bytes', nativeType: 'LongBlob' }],
  ['postgresql', { ...scalar, nativeType: 'Xml' }],
] as [DatabaseProvider, ResolvedDBField][])(
  'rejects unsupported native index types on %s: %j',
  (provider, field) => {
    for (const option of ['indexes', 'unique'] as const) {
      expect(() =>
        resolveDatabaseIndexes(
          'Test',
          provider,
          { [option]: [{ fields: ['a', 'b'] }] },
          { ...fields, b: field }
        )
      ).toThrow(/Test\.db\.(indexes|unique)\[0\]: (MySQL|PostgreSQL).*"b"/)
    }
  }
)

test.each([
  ['mysql', { ...scalar, nativeType: 'VarChar(100)' }],
  ['mysql', { ...scalar, scalar: 'Bytes', nativeType: 'VarBinary(100)' }],
  ['postgresql', { ...scalar, nativeType: 'Text' }],
  ['postgresql', { ...scalar, scalar: 'Bytes' }],
  ['sqlite', { ...scalar, scalar: 'Bytes' }],
  ...(['Boolean', 'Int', 'Float', 'DateTime', 'BigInt', 'Decimal'] as const).map(scalarType => [
    'postgresql',
    { ...scalar, scalar: scalarType },
  ]),
] as [DatabaseProvider, ResolvedDBField][])(
  'accepts supported scalar types on %s: %j',
  (provider, field) => {
    expect(
      resolveDatabaseIndexes(
        'Test',
        provider,
        { unique: [{ fields: ['a', 'b'] }] },
        { ...fields, b: field }
      )
    ).toEqual([{ kind: 'unique', fields: ['a', 'b'] }])
  }
)
