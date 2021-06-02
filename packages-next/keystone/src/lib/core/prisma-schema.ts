import {
  DBField,
  MultiDBField,
  NoDBField,
  ScalarishDBField,
  ScalarDBField,
  ScalarDBFieldDefault,
  DatabaseProvider,
} from '@keystone-next/types';

// TODO: probably validate that list keys and fields are valid prisma identifiers
// (though this might happen at another level and prisma identifiers might be equal to or a superset of graphql identifiers so this might not be necessary?)

type ListsToPrintPrismaSchema = Record<string, { fields: FieldsToPrintPrismaSchema }>;

type FieldsToPrintPrismaSchema = Record<string, { dbField: DBField }>;

type BaseComputedRelationDBField = {
  kind: 'relation';
  list: string;
  field: string;
  relationName: string;
};

export type ResolvedRelationDBField =
  | (BaseComputedRelationDBField & {
      mode: 'many';
    })
  | (BaseComputedRelationDBField & {
      mode: 'one';
      foreignIdField: 'none' | 'owned' | 'owned-unique';
    });

export type ListsWithResolvedRelations = Record<string, { fields: FieldsWithResolvedRelations }>;

export type ResolvedDBField =
  | ResolvedRelationDBField
  | ScalarishDBField
  | NoDBField
  | MultiDBField<Record<string, ScalarishDBField>>;

// note: all keystone fields correspond to a field here
// not all fields here correspond to keystone fields(the implicit side of one-sided relation fields)
type FieldsWithResolvedRelations = Record<string, ResolvedDBField>;

type Rel = {
  listKey: string;
  fieldPath: string;
  mode: 'many' | 'one';
};

function sortRelationships(left: Rel, right: Rel) {
  const order = left.listKey.localeCompare(right.listKey);
  if (order > 0) {
    // left comes after right, so swap them.
    return [right, left];
  } else if (order === 0) {
    // self referential list, so check the paths.
    if (left.fieldPath.localeCompare(right.fieldPath) > 0) {
      return [right, left];
    }
  }
  return [left, right];
}

// what's going on here:
// - validating all the relationships
// - for relationships involving to-one: deciding which side owns the foreign key
// - turning one-sided relationships into two-sided relationships so that elsewhere in Keystone,
//   you only have to reason about two-sided relationships
//   (note that this means that there are "fields" in the returned ListsWithResolvedRelations
//   which are not actually proper Keystone fields, they are just a db field and nothing else)
export function resolveRelationships(lists: ListsToPrintPrismaSchema): ListsWithResolvedRelations {
  const alreadyResolvedTwoSidedRelationships = new Set<string>();
  const resolvedLists: ListsWithResolvedRelations = Object.fromEntries(
    Object.keys(lists).map(listKey => [listKey, { fields: {} }])
  );
  for (const [listKey, fields] of Object.entries(lists)) {
    const resolvedList = resolvedLists[listKey];
    for (const [fieldPath, { dbField: field }] of Object.entries(fields.fields)) {
      if (field.kind !== 'relation') {
        resolvedList.fields[fieldPath] = field;
        continue;
      }
      const foreignUnresolvedList = lists[field.list];
      if (!foreignUnresolvedList) {
        throw new Error(
          `The relationship field at ${listKey}.${fieldPath} points to the list ${listKey} which does not exist`
        );
      }
      if (field.field) {
        const localRef = `${listKey}.${fieldPath}`;
        const foreignRef = `${field.list}.${field.field}`;
        if (alreadyResolvedTwoSidedRelationships.has(localRef)) {
          continue;
        }
        alreadyResolvedTwoSidedRelationships.add(foreignRef);
        const foreignField = foreignUnresolvedList.fields[field.field]?.dbField;
        if (!foreignField) {
          throw new Error(
            `The relationship field at ${localRef} points to ${foreignRef} but no field at ${foreignRef} exists`
          );
        }

        if (foreignField.kind !== 'relation') {
          throw new Error(
            `The relationship field at ${localRef} points to ${foreignRef} but ${foreignRef} is not a relationship field`
          );
        }

        if (foreignField.list !== listKey) {
          throw new Error(
            `The relationship field at ${localRef} points to ${foreignRef} but ${foreignRef} points to the list ${foreignField.list} rather than ${listKey}`
          );
        }

        if (foreignField.field === undefined) {
          throw new Error(
            `The relationship field at ${localRef} points to ${foreignRef}, ${localRef} points to ${listKey} correctly but does not point to the ${fieldPath} field when it should`
          );
        }

        if (foreignField.field !== fieldPath) {
          throw new Error(
            `The relationship field at ${localRef} points to ${foreignRef}, ${localRef} points to ${listKey} correctly but points to the ${foreignField.field} field instead of ${fieldPath}`
          );
        }

        let [leftRel, rightRel] = sortRelationships(
          { listKey, fieldPath, mode: field.mode },
          { listKey: field.list, fieldPath: field.field, mode: foreignField.mode }
        );

        if (leftRel.mode === 'one' && rightRel.mode === 'one') {
          const relationName = `${leftRel.listKey}_${leftRel.fieldPath}`;
          resolvedLists[leftRel.listKey].fields[leftRel.fieldPath] = {
            kind: 'relation',
            mode: 'one',
            field: rightRel.fieldPath,
            list: rightRel.listKey,
            foreignIdField: 'owned-unique',
            relationName,
          };
          resolvedLists[rightRel.listKey].fields[rightRel.fieldPath] = {
            kind: 'relation',
            mode: 'one',
            field: leftRel.fieldPath,
            list: leftRel.listKey,
            foreignIdField: 'none',
            relationName,
          };
          continue;
        }
        if (leftRel.mode === 'many' && rightRel.mode === 'many') {
          const relationName = `${leftRel.listKey}_${leftRel.fieldPath}_${rightRel.listKey}_${rightRel.fieldPath}`;
          resolvedLists[leftRel.listKey].fields[leftRel.fieldPath] = {
            kind: 'relation',
            mode: 'many',
            field: rightRel.fieldPath,
            list: rightRel.listKey,
            relationName,
          };
          resolvedLists[rightRel.listKey].fields[rightRel.fieldPath] = {
            kind: 'relation',
            mode: 'many',
            field: leftRel.fieldPath,
            list: leftRel.listKey,
            relationName,
          };
          continue;
        }
        // if we're here, we're in a 1:N
        // and we want to make sure the 1 side on the left and the many on the right
        // (technically only one of these checks is necessary, the other one will have to be true if one is
        // but this communicates what's going on here)
        if (leftRel.mode === 'many' && rightRel.mode === 'one') {
          [leftRel, rightRel] = [rightRel, leftRel];
        }
        const relationName = `${leftRel.listKey}_${leftRel.fieldPath}`;
        resolvedLists[leftRel.listKey].fields[leftRel.fieldPath] = {
          kind: 'relation',
          mode: 'one',
          field: rightRel.fieldPath,
          list: rightRel.listKey,
          foreignIdField: 'owned',
          relationName,
        };
        resolvedLists[rightRel.listKey].fields[rightRel.fieldPath] = {
          kind: 'relation',
          mode: 'many',
          field: leftRel.fieldPath,
          list: leftRel.listKey,
          relationName,
        };
        continue;
      }
      const foreignFieldPath = `from_${listKey}_${fieldPath}`;
      if (foreignUnresolvedList.fields[foreignFieldPath]) {
        throw new Error(
          `The relationship field at ${listKey}.${fieldPath} points to the list ${field.list}, Keystone needs to a create a relationship field at ${field.list}.${foreignFieldPath} to support the relationship at ${listKey}.${fieldPath} but ${field.list} already has a field named ${foreignFieldPath}`
        );
      }

      if (field.mode === 'many') {
        const relationName = `${listKey}_${fieldPath}_many`;
        resolvedLists[field.list].fields[foreignFieldPath] = {
          kind: 'relation',
          mode: 'many',
          list: listKey,
          field: fieldPath,
          relationName,
        };
        resolvedList.fields[fieldPath] = {
          kind: 'relation',
          mode: 'many',
          list: field.list,
          field: foreignFieldPath,
          relationName,
        };
      } else {
        const relationName = `${listKey}_${fieldPath}`;
        resolvedLists[field.list].fields[foreignFieldPath] = {
          kind: 'relation',
          mode: 'many',
          list: listKey,
          field: fieldPath,
          relationName,
        };
        resolvedList.fields[fieldPath] = {
          kind: 'relation',
          list: field.list,
          field: foreignFieldPath,
          foreignIdField: 'owned',
          relationName,
          mode: 'one',
        };
      }
    }
  }
  // resolving the relationships essentially means that the relationships will be in a different order in the fields of a list
  // this doesn't really change the behaviour of anything but it means that the order of the fields in the prisma schema will be
  // the same as the user provided
  return Object.fromEntries(
    Object.entries(resolvedLists).map(([listKey, list]) => {
      // this adds the fields based on the order that the user passed in
      // (except it will not add the opposites to one-sided relations)
      const fields = Object.fromEntries(
        Object.keys(lists[listKey].fields).map(fieldKey => [fieldKey, list.fields[fieldKey]])
      );
      // then we add the opposites to one-sided relations
      for (const [fieldKey, fieldVal] of Object.entries(list.fields)) {
        fields[fieldKey] = fieldVal;
      }
      return [listKey, { fields }];
    })
  );
}

function areArraysEqual(a: any[], b: any[]) {
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

export function getDBFieldPathForFieldOnMultiField(fieldPath: string, subField: string) {
  return `${fieldPath}_${subField}`;
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
    return `${fieldPath} ${field.scalar}${
      modifiers[field.mode]
    }${nativeType}${defaultValue}${index}`;
  }
  if (field.kind === 'enum') {
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default ? ` @default(${field.default})` : '';
    return `${fieldPath} ${field.name}${modifiers[field.mode]}${defaultValue}${index}`;
  }
  if (field.kind === 'multi') {
    return Object.entries(field.fields)
      .map(([subField, field]) =>
        printField(
          getDBFieldPathForFieldOnMultiField(fieldPath, subField),
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
    const foreignIdField = lists[field.list].fields.id;
    assertFieldIsValidIdField(field.list, foreignIdField);
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
  const enums: Record<string, { values: string[]; firstDefinedByRef: string }> = {};
  for (const [listKey, { fields }] of Object.entries(lists)) {
    for (const [fieldPath, field] of Object.entries(fields)) {
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
            `The fields ${alreadyExistingEnum.firstDefinedByRef} and ${field.values} both specify Prisma`
          );
        }
      }
    }
  }
  return Object.entries(enums)
    .map(([enumName, { values }]) => `enum ${enumName} {\n${values.join('\n')}\n}`)
    .join('\n');
}

function assertFieldIsValidIdField(
  listKey: string,
  field: ResolvedDBField
): asserts field is ScalarDBField<'Int' | 'String', 'required'> {
  if (field.kind !== 'scalar') {
    throw new Error(
      `id fields must be either String or Int Prisma scalars but the id field for the ${listKey} list is not a scalar`
    );
  }
  if (field.scalar !== 'String' && field.scalar !== 'Int') {
    throw new Error(
      `id fields must be either String or Int Prisma scalars but the id field for the ${listKey} list is a ${field.scalar} scalar`
    );
  }
  if (field.mode !== 'required') {
    throw new Error(
      `id fields must singular required field but the id field for the ${listKey} list ${
        field.mode === 'many' ? 'a many' : 'an optional'
      } field`
    );
  }
  if (field.index !== undefined) {
    throw new Error(
      `id fields must not specify indexes themselves but the id field for the ${listKey} list specifies an index`
    );
  }
  if (field.default === undefined) {
    throw new Error(
      `id fields must specify a Prisma/database level default value but the id field for the ${listKey} list does not`
    );
  }
}

export function printPrismaSchema(
  lists: ListsWithResolvedRelations,
  provider: DatabaseProvider,
  clientDir: string
) {
  let prismaSchema = `datasource ${provider} {
  url = env("DATABASE_URL")
  provider = "${provider}"
}

generator client {
  provider = "prisma-client-js"
  output = "${clientDir}"
}
\n`;
  for (const [listKey, { fields }] of Object.entries(lists)) {
    prismaSchema += `model ${listKey} {`;
    for (const [fieldPath, field] of Object.entries(fields)) {
      if (field.kind !== 'none') {
        prismaSchema += '\n' + printField(fieldPath, field, provider, lists);
      }
      if (fieldPath === 'id') {
        assertFieldIsValidIdField(listKey, field);
        prismaSchema += ' @id';
      }
    }
    prismaSchema += `\n}\n`;
  }
  prismaSchema += `\n${collectEnums(lists)}\n`;

  return prismaSchema;
}
