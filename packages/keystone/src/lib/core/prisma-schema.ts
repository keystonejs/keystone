import { ScalarDBField, ScalarDBFieldDefault, DatabaseProvider } from '../../types';
import { ResolvedDBField, ListsWithResolvedRelations } from './resolve-relationships';
import { getDBFieldKeyForFieldOnMultiField } from './utils';

function areArraysEqual(a: readonly unknown[], b: readonly unknown[]) {
  if (a.length !== b.length) {
    return false;
  }
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

const modifiers = {
  required: '',
  optional: '?',
  many: '[]',
};

function printIndex(fieldPath: string, index: undefined | 'index' | 'unique') {
  return {
    none: '',
    unique: '@unique',
    index: `\n@@index([${fieldPath}])`,
  }[index || ('none' as const)];
}

function printNativeType(nativeType: string | undefined, datasourceName: string) {
  return nativeType === undefined ? '' : ` @${datasourceName}.${nativeType}`;
}

function printScalarDefaultValue(defaultValue: ScalarDBFieldDefault): string {
  if (defaultValue.kind === 'literal') {
    if (typeof defaultValue.value === 'string') {
      return JSON.stringify(defaultValue.value);
    }
    return defaultValue.value.toString();
  }
  if (
    defaultValue.kind === 'now' ||
    defaultValue.kind === 'autoincrement' ||
    defaultValue.kind === 'cuid' ||
    defaultValue.kind === 'uuid'
  ) {
    return `${defaultValue.kind}()`;
  }
  if (defaultValue.kind === 'dbgenerated') {
    return `dbgenerated(${JSON.stringify(defaultValue.value)})`;
  }
  assertNever(defaultValue);
}

function assertNever(arg: never): never {
  throw new Error(`expected to never be called but was called with ${arg}`);
}

function printField(
  fieldPath: string,
  field: Exclude<ResolvedDBField, { kind: 'none' }>,
  datasourceName: string,
  lists: ListsWithResolvedRelations
): string {
  if (field.kind === 'scalar') {
    const nativeType = printNativeType(field.nativeType, datasourceName);
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default
      ? ` @default(${printScalarDefaultValue(field.default)})`
      : '';
    const updatedAt = field.updatedAt ? ' @updatedAt' : '';
    return `${fieldPath} ${field.scalar}${
      modifiers[field.mode]
    }${updatedAt}${nativeType}${defaultValue}${index}`;
  }
  if (field.kind === 'enum') {
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default ? ` @default(${field.default.value})` : '';
    return `${fieldPath} ${field.name}${modifiers[field.mode]}${defaultValue}${index}`;
  }
  if (field.kind === 'multi') {
    return Object.entries(field.fields)
      .map(([subField, field]) =>
        printField(
          getDBFieldKeyForFieldOnMultiField(fieldPath, subField),
          field,
          datasourceName,
          lists
        )
      )
      .join('\n');
  }
  if (field.kind === 'relation') {
    if (field.mode === 'many') {
      return `${fieldPath} ${field.list}[] @relation("${field.relationName}")`;
    }
    if (field.foreignIdField === 'none') {
      return `${fieldPath} ${field.list}? @relation("${field.relationName}")`;
    }
    const relationIdFieldPath = `${fieldPath}Id`;
    const relationField = `${fieldPath} ${field.list}? @relation("${field.relationName}", fields: [${relationIdFieldPath}], references: [id])`;
    const foreignIdField = lists[field.list].resolvedDbFields.id;
    assertDbFieldIsValidForIdField(field.list, foreignIdField);
    const nativeType = printNativeType(foreignIdField.nativeType, datasourceName);
    const index = printIndex(
      relationIdFieldPath,
      field.foreignIdField === 'owned' ? 'index' : 'unique'
    );
    const relationIdField = `${relationIdFieldPath} ${foreignIdField.scalar}? @map("${fieldPath}") ${nativeType}${index}`;
    return `${relationField}\n${relationIdField}`;
  }
  // TypeScript's control flow analysis doesn't understand that this will never happen without the assertNever
  // (this will still correctly validate if any case is unhandled though)
  return assertNever(field);
}

function collectEnums(lists: ListsWithResolvedRelations) {
  const enums: Record<string, { values: readonly string[]; firstDefinedByRef: string }> = {};
  for (const [listKey, { resolvedDbFields }] of Object.entries(lists)) {
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      const fields =
        field.kind === 'multi'
          ? Object.entries(field.fields).map(
              ([key, field]) => [field, `${listKey}.${fieldPath} (sub field ${key})`] as const
            )
          : [[field, `${listKey}.${fieldPath}`] as const];

      for (const [field, ref] of fields) {
        if (field.kind !== 'enum') continue;
        const alreadyExistingEnum = enums[field.name];
        if (alreadyExistingEnum === undefined) {
          enums[field.name] = {
            values: field.values,
            firstDefinedByRef: ref,
          };
          continue;
        }
        if (!areArraysEqual(alreadyExistingEnum.values, field.values)) {
          throw new Error(
            `The fields ${alreadyExistingEnum.firstDefinedByRef} and ${ref} both specify Prisma schema enums` +
              `with the name ${field.name} but they have different values:\n` +
              `enum from ${alreadyExistingEnum.firstDefinedByRef}:\n${JSON.stringify(
                alreadyExistingEnum.values,
                null,
                2
              )}\n` +
              `enum from ${ref}:\n${JSON.stringify(field.values, null, 2)}`
          );
        }
      }
    }
  }
  return Object.entries(enums)
    .map(([enumName, { values }]) => `enum ${enumName} {\n${values.join('\n')}\n}`)
    .join('\n');
}

function assertDbFieldIsValidForIdField(
  listKey: string,
  field: ResolvedDBField
): asserts field is ScalarDBField<'Int' | 'String', 'required'> {
  if (field.kind !== 'scalar') {
    throw new Error(
      `id fields must be either a String or Int Prisma scalar but the id field for the ${listKey} list is not a scalar`
    );
  }
  // this may be loosened in the future
  if (field.scalar !== 'String' && field.scalar !== 'Int') {
    throw new Error(
      `id fields must be either String or Int Prisma scalars but the id field for the ${listKey} list is a ${field.scalar} scalar`
    );
  }
  if (field.mode !== 'required') {
    throw new Error(
      `id fields must be a singular required field but the id field for the ${listKey} list is ${
        field.mode === 'many' ? 'a many' : 'an optional'
      } field`
    );
  }
  if (field.index !== undefined) {
    throw new Error(
      `id fields must not specify indexes themselves but the id field for the ${listKey} list specifies an index`
    );
  }
  // this will likely be loosened in the future
  if (field.default === undefined) {
    throw new Error(
      `id fields must specify a Prisma/database level default value but the id field for the ${listKey} list does not`
    );
  }
}

export function printPrismaSchema(
  lists: ListsWithResolvedRelations,
  provider: DatabaseProvider,
  prismaPreviewFeatures: readonly string[] | undefined
) {
  let prismaFlags = '';
  if (prismaPreviewFeatures && prismaPreviewFeatures.length) {
    prismaFlags = `\n  previewFeatures = ["${prismaPreviewFeatures.join('","')}"]`;
  }
  let prismaSchema = `// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${provider} {
  url = env("DATABASE_URL")
  provider = "${provider}"
}

generator client {
  provider = "prisma-client-js"
  output = "node_modules/.prisma/client"${prismaFlags}
  engineType = "binary"
}
\n`;
  for (const [listKey, { resolvedDbFields }] of Object.entries(lists)) {
    prismaSchema += `model ${listKey} {`;
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      if (field.kind !== 'none') {
        prismaSchema += '\n' + printField(fieldPath, field, provider, lists);
      }
      if (fieldPath === 'id') {
        assertDbFieldIsValidForIdField(listKey, field);
        prismaSchema += ' @id';
      }
    }
    prismaSchema += `\n}\n`;
  }
  prismaSchema += `\n${collectEnums(lists)}\n`;

  return prismaSchema;
}
