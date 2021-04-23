import { NextFieldType } from '@keystone-next/types';
import { getDBFieldPathForFieldOnMultiField, ResolvedDBField } from './prisma-schema';

export type InputFilter = Record<string, any> & { _____?: 'input filter' };
export type PrismaFilter = Record<string, any> & { _____?: 'prisma filter' };
export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & { _____?: 'unique prisma filter' };

function nestWithAppropiateField(
  fieldKey: string,
  dbField: ResolvedDBField,
  value: Record<string, any>
) {
  if (dbField.kind !== 'multi') {
    return { [fieldKey]: value };
  }
  Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      getDBFieldPathForFieldOnMultiField(fieldKey, key),
      val,
    ])
  );
}

export type InputResolvers = {
  where: (input: InputFilter) => Promise<PrismaFilter>;
  // TODO: these types should be different
  uniqueWhere: (input: UniqueInputFilter) => Promise<UniquePrismaFilter>;
};

export async function resolveWhereInput(
  inputFilter: InputFilter,
  fields: Record<
    string,
    // i am intentionally only passing in specific things to make it clear this function cares about nothing else
    {
      dbField: ResolvedDBField;
      input?: {
        where?: NonNullable<NonNullable<NextFieldType['input']>['where']>;
      };
    }
  >
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, fields))
            ),
          };
        }
        const field = fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        const where = field.input!.where!;
        const dbField = field.dbField;
        const { AND, OR, NOT, ...rest } = where.resolve ? await where.resolve(value) : value;
        return {
          AND: AND?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          OR: OR?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          NOT: NOT?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          ...nestWithAppropiateField(fieldKey, dbField, rest),
        };
      })
    ),
  };
}
