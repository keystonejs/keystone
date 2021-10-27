import { DBField, KeystoneContext } from '../../types';
import { userInputError } from './graphql-errors';
import { InitialisedList } from './types-for-lists';
import { getDBFieldKeyForFieldOnMultiField } from './utils';

export type InputFilter = Record<string, any> & {
  _____?: 'input filter';
  AND?: InputFilter[];
  OR?: InputFilter[];
  NOT?: InputFilter[];
};
export type PrismaFilter = Record<string, any> & {
  _____?: 'prisma filter';
  AND?: PrismaFilter[] | PrismaFilter;
  OR?: PrismaFilter[] | PrismaFilter;
  NOT?: PrismaFilter[] | PrismaFilter;
  // just so that if you pass an array to something expecting a PrismaFilter, you get an error
  length?: undefined;
  // so that if you pass a promise, you get an error
  then?: undefined;
};

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & {
  _____?: 'unique prisma filter';
  // so that if you pass a promise, you get an error
  then?: undefined;
};

export async function resolveUniqueWhereInput(
  input: UniqueInputFilter,
  fields: InitialisedList['fields'],
  context: KeystoneContext
): Promise<UniquePrismaFilter> {
  const inputKeys = Object.keys(input);
  if (inputKeys.length !== 1) {
    throw userInputError(
      `Exactly one key must be passed in a unique where input but ${inputKeys.length} keys were passed`
    );
  }
  const key = inputKeys[0];
  const val = input[key];
  if (val === null) {
    throw userInputError(`The unique value provided in a unique where input must not be null`);
  }
  const resolver = fields[key].input!.uniqueWhere!.resolve;
  return { [key]: resolver ? await resolver(val, context) : val };
}

export async function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, list, context))
            ),
          };
        }
        const field = list.fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        const where = field.input!.where!;
        const dbField = field.dbField;
        const ret = where.resolve
          ? await where.resolve(
              value,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined as any;
                }
                const foreignList = field.dbField.list;
                const whereResolver = (val: any) =>
                  resolveWhereInput(val, list.lists[foreignList], context);
                if (field.dbField.mode === 'many') {
                  return async () => {
                    if (value === null) {
                      throw userInputError('A many relation filter cannot be set to null');
                    }
                    return Object.fromEntries(
                      await Promise.all(
                        Object.entries(value).map(async ([key, val]) => {
                          if (val === null) {
                            throw userInputError(
                              `The key "${key}" in a many relation filter cannot be set to null`
                            );
                          }
                          return [key, await whereResolver(val)];
                        })
                      )
                    );
                  };
                }
                return (val: any) => {
                  if (val === null) {
                    return null;
                  }
                  return whereResolver(val);
                };
              })()
            )
          : value;
        if (ret === null) {
          if (field.dbField.kind === 'multi') {
            // Note: no built-in field types support multi valued database fields *and* filtering.
            // This code path is only relevent to custom fields which fit that criteria.
            throw new Error('multi db fields cannot return null from where input resolvers');
          }
          return { [fieldKey]: null };
        }
        return handleOperators(fieldKey, dbField, ret);
      })
    ),
  };
}

function handleOperators(fieldKey: string, dbField: DBField, { AND, OR, NOT, ...rest }: any) {
  return {
    AND: AND?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    OR: OR?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    NOT: NOT?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    ...nestWithAppropiateField(fieldKey, dbField, rest),
  };
}

function nestWithAppropiateField(fieldKey: string, dbField: DBField, value: any) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        getDBFieldKeyForFieldOnMultiField(fieldKey, key),
        val,
      ])
    );
  }
  return { [fieldKey]: value };
}
