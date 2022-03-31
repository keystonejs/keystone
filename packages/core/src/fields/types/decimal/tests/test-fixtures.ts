import { DatabaseProvider, KeystoneContext } from '../../../../types';
import { decimal } from '..';

export const name = 'Decimal';
export const typeFunction = decimal;
export const exampleValue = () => '6.28';
export const exampleValue2 = () => '6.45';
export const supportsNullInput = true;
export const supportsUnique = true;
export const fieldName = 'price';
export const unSupportedAdapterList = ['sqlite'];
export const supportsDbMap = true;

export const getTestFields = () => ({ price: decimal(fieldConfig()) });

export const fieldConfig = () => ({ scale: 2, validation: { min: '-300', max: '50000000' } });

export const initItems = () => {
  return [
    { name: 'price1', price: '-123.45' },
    { name: 'price2', price: '0.01' },
    { name: 'price3', price: '50.00' },
    { name: 'price4', price: '2000.00' },
    { name: 'price5', price: '40000.00' },
    { name: 'price6', price: null },
    { name: 'price7' },
  ];
};

export const storedValues = () => [
  { name: 'price1', price: '-123.45' },
  { name: 'price2', price: '0.01' },
  { name: 'price3', price: '50.00' },
  { name: 'price4', price: '2000.00' },
  { name: 'price5', price: '40000.00' },
  { name: 'price6', price: null },
  { name: 'price7', price: null },
];

export const supportedFilters = (provider: DatabaseProvider) => [
  'null_equality',
  'equality',
  'ordering',
  provider !== 'postgresql' && 'in_empty_null',
  provider !== 'postgresql' && 'in_equal',
  'unique_equality',
];

export const crudTests = (keystoneTestWrapper: any) => {
  test(
    'errors when below validation.min',
    keystoneTestWrapper(async ({ context }: { context: KeystoneContext }) => {
      const result = await context.graphql.raw({
        query: `
          mutation {
            createTest(data: { price: "-400" }) {
              id
              decimal
            }
          }
        `,
      });
      expect(result.data).toEqual({ createTest: null });
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].message).toMatchInlineSnapshot();
    })
  );
};
