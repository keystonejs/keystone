import type { DatabaseProvider, ListDBConfig } from '../../types/index.ts'
import type { ResolvedDBField } from './resolve-relationships.ts'

export type DatabaseIndex = {
  kind: 'index' | 'unique'
  fields: string[]
}

/** Resolve declarations only after relationships and each field's database shape are known. */
export function resolveDatabaseIndexes(
  listKey: string,
  provider: DatabaseProvider,
  db: ListDBConfig,
  resolvedDbFields: Record<string, ResolvedDBField>
): DatabaseIndex[] {
  const result: DatabaseIndex[] = []

  for (const option of ['indexes', 'unique'] as const) {
    // Omitted options add nothing; configured options must be declaration arrays.
    const declarations = db[option]

    if (declarations === undefined) {
      continue
    }

    if (!Array.isArray(declarations)) {
      throw new Error(
        `${listKey}.db.${option}: expected an array of { fields: [...] } declarations`
      )
    }

    const seen = new Map<string, string>()

    for (const [position, declaration] of declarations.entries()) {
      const path = `${listKey}.db.${option}[${position}]`

      // Each declaration must be an object containing a field list.
      if (
        !declaration ||
        typeof declaration !== 'object' ||
        Array.isArray(declaration) ||
        !Array.isArray(declaration.fields)
      ) {
        throw new Error(`${path}: expected { fields: [...] }`)
      }

      // Advanced index options remain the responsibility of schema extensions.
      if (Object.keys(declaration).some(key => key !== 'fields')) {
        throw new Error(
          `${path}: only "fields" is supported; use db.extendPrismaSchema for other index options`
        )
      }

      // Indexes need at least one field; unique constraints must be compound.
      if (option === 'unique') {
        if (declaration.fields.length < 2) {
          throw new Error(
            `${path}: expected at least two fields; use field-level isIndexed: 'unique' for a single field`
          )
        }
      } else if (declaration.fields.length < 1) {
        throw new Error(`${path}: expected at least one field`)
      }

      const fields: string[] = []

      for (const fieldKey of declaration.fields) {
        // Field references must be non-empty keys, not expressions or index options.
        if (typeof fieldKey !== 'string' || !fieldKey.length) {
          throw new Error(`${path}: fields must be non-empty field key strings`)
        }

        // A field can appear only once within a declaration.
        if (fields.includes(fieldKey)) {
          throw new Error(`${path}: repeated field "${fieldKey}"`)
        }

        // Resolve Keystone field keys rather than mapped database column names.
        if (!Object.hasOwn(resolvedDbFields, fieldKey)) {
          throw new Error(
            `${path}: unknown field "${fieldKey}"; use Keystone field keys, not database column names`
          )
        }

        // Only fields storing a single scalar or enum value are supported.
        const field = resolvedDbFields[fieldKey]

        if ((field.kind !== 'scalar' && field.kind !== 'enum') || field.mode === 'many') {
          throw new Error(
            `${path}: field "${fieldKey}" must store a single scalar or enum value; relationships, virtual, multi-column and array fields are not supported. Use db.extendPrismaSchema for advanced indexes`
          )
        }

        if (field.kind === 'scalar') {
          // JSON indexing requires provider-specific options outside this API.
          if (field.scalar === 'Json') {
            throw new Error(
              `${path}: Json field "${fieldKey}" is not supported; use db.extendPrismaSchema for provider-specific indexes`
            )
          }

          const nativeType = field.nativeType?.split('(')[0].trim()

          // MySQL Text/Blob indexes require lengths that these declarations cannot express.
          if (
            provider === 'mysql' &&
            (/^(Tiny|Medium|Long)?(Text|Blob)$/.test(nativeType ?? '') ||
              (field.scalar === 'Bytes' && nativeType === undefined))
          ) {
            throw new Error(
              `${path}: MySQL field "${fieldKey}" uses a Text/Blob type that requires an index length; choose a bounded native type or use db.extendPrismaSchema`
            )
          }

          // PostgreSQL Xml has no default index support.
          if (provider === 'postgresql' && nativeType === 'Xml') {
            throw new Error(
              `${path}: PostgreSQL Xml field "${fieldKey}" does not support a default index; use db.extendPrismaSchema for a provider-specific expression`
            )
          }
        }

        // Do not duplicate a primary key or field-level index with a single-field declaration.
        if (declaration.fields.length === 1 && (fieldKey === 'id' || field.index)) {
          throw new Error(
            `${path}: field "${fieldKey}" is already indexed by its primary key or field-level isIndexed setting`
          )
        }

        fields.push(fieldKey)
      }

      // Reject duplicate declarations of the same kind without sorting their field order.
      const key = JSON.stringify(fields)
      const previous = seen.get(key)

      if (previous !== undefined) {
        throw new Error(
          `${path}: duplicates ${previous}; each ordered field combination must be declared only once per index kind`
        )
      }

      seen.set(key, path)

      if (option === 'indexes') {
        result.push({ kind: 'index', fields })
      } else {
        result.push({ kind: 'unique', fields })
      }
    }
  }

  return result
}
