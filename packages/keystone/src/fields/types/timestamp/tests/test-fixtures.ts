import { DatabaseProvider, KeystoneContext } from '../../../../types';
import { timestamp } from '..';

export const name = 'Timestamp';
export const typeFunction = timestamp;
export const exampleValue = () => '1990-12-31T12:34:56.789Z';
export const exampleValue2 = () => '2000-01-20T00:08:00.000Z';
export const supportsNullInput = true;
export const supportsUnique = true;
export const supportsDbMap = true;
export const fieldName = 'lastOnline';

export const getTestFields = () => ({ lastOnline: timestamp() });

export const initItems = () => {
  return [
    { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
    { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
    { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
    { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
    { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
    { name: 'person6', lastOnline: null },
    { name: 'person7' },
  ];
};

export const storedValues = () => [
  { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
  { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
  { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
  { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
  { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
  { name: 'person6', lastOnline: null },
  { name: 'person7', lastOnline: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
  'unique_equality',
];

export const filterTests = (withKeystone: (args: any) => any) => {
  const match = async (
    context: KeystoneContext,
    where: Record<string, any> | undefined,
    expected: any,
    orderBy: Record<string, 'asc' | 'desc'> = { name: 'asc' }
  ) =>
    expect(await context.query.Test.findMany({ where, orderBy, query: 'name lastOnline' })).toEqual(
      expected
    );

  test(
    'Ordering: orderBy: { lastOnline: asc }',
    withKeystone(
      ({ context, provider }: { context: KeystoneContext; provider: DatabaseProvider }) =>
        match(
          context,
          undefined,
          provider === 'sqlite'
            ? [
                { name: 'person6', lastOnline: null },
                { name: 'person7', lastOnline: null },
                { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
                { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
                { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
                { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
                { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
              ]
            : [
                { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
                { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
                { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
                { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
                { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
                { name: 'person6', lastOnline: null },
                { name: 'person7', lastOnline: null },
              ],
          { lastOnline: 'asc' }
        )
    )
  );

  test(
    'Ordering: orderBy: { lastOnline: desc }',
    withKeystone(
      ({ context, provider }: { context: KeystoneContext; provider: DatabaseProvider }) =>
        match(
          context,
          undefined,
          provider === 'sqlite'
            ? [
                { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
                { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
                { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
                { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
                { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
                { name: 'person6', lastOnline: null },
                { name: 'person7', lastOnline: null },
              ]
            : [
                { name: 'person7', lastOnline: null },
                { name: 'person6', lastOnline: null },
                { name: 'person5', lastOnline: '2020-06-10T10:20:30.456Z' },
                { name: 'person4', lastOnline: '2000-01-20T00:08:00.000Z' },
                { name: 'person3', lastOnline: '1990-12-31T12:34:56.789Z' },
                { name: 'person2', lastOnline: '1980-10-01T23:59:59.999Z' },
                { name: 'person1', lastOnline: '1979-04-12T00:08:00.000Z' },
              ],
          { lastOnline: 'desc' }
        )
    )
  );
};
