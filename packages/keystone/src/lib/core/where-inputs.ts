import { KeystoneContext } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

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
  uniqueInput: UniqueInputFilter,
  fields: InitialisedList['fields'],
  context: KeystoneContext
): Promise<UniquePrismaFilter> {
  const inputKeys = Object.keys(uniqueInput);
  if (inputKeys.length !== 1) {
    throw new Error(
      `Exactly one key must be passed in a unique where input but ${inputKeys.length} keys were passed`
    );
  }
  const key = inputKeys[0];
  const val = uniqueInput[key];
  if (val === null) {
    throw new Error(`The unique value provided in a unique where input must not be null`);
  }

  const resolver = fields[key].input!.uniqueWhere!.resolve;
  return { [key]: resolver ? await resolver(val, context) : val };
}

export async function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, list))
            ),
          };
        }
        return list.filterImpls[fieldKey](value);
      })
    ),
  };
}
