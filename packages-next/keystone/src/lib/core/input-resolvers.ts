import { NextFieldType, ReadListAccessControl } from '@keystone-next/types';
import { getDBFieldPathForFieldOnMultiField, ResolvedDBField } from './prisma-schema';

type InputFilter = Record<string, any> & { _____inputFilter: true };
type PrismaFilter = Record<string, any> & { _____prismaFilter: true };

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

export type InputResolver = (input: Record<string, any>) => Promise<Record<string, any>>;

export type InputResolvers = {
  where: InputResolver;
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
  >,
  resolvers: Record<string, InputResolvers>
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        const field = fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        const where = field.input!.where!;
        const dbField = field.dbField;
        const { AND, OR, NOT, ...rest } = where.resolve ? where.resolve(value, resolvers) : value;
        return {
          AND: AND?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          OR: OR?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          NOT: NOT?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          ...nestWithAppropiateField(fieldKey, dbField, rest),
        };
      })
    ),
  } as any;
}
