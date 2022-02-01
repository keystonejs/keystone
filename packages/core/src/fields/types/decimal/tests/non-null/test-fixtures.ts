import { decimal } from '../..';

export const name = 'Decimal with isNullable: false';
export const typeFunction = (x: any) => decimal({ ...x, db: { ...x?.db, isNullable: false } });
export const exampleValue = () => '6.28';
export const exampleValue2 = () => '6.45';
export const supportsGraphQLIsNonNull = true;
export const supportsUnique = true;
export const fieldName = 'price';
export const unSupportedAdapterList = ['sqlite'];
export const supportsDbMap = true;

export const getTestFields = () => ({ price: decimal({ scale: 2, db: { isNullable: false } }) });

export const initItems = () => {
  return [
    { name: 'price1', price: '-123.45' },
    { name: 'price2', price: '0.01' },
    { name: 'price3', price: '50.00' },
    { name: 'price4', price: '2000.00' },
    { name: 'price5', price: '40000.00' },
    { name: 'price6', price: '1.00' },
    { name: 'price7', price: '2.00' },
  ];
};

export const storedValues = () => [
  { name: 'price1', price: '-123.45' },
  { name: 'price2', price: '0.01' },
  { name: 'price3', price: '50.00' },
  { name: 'price4', price: '2000.00' },
  { name: 'price5', price: '40000.00' },
  { name: 'price6', price: '1.00' },
  { name: 'price7', price: '2.00' },
];

export const supportedFilters = () => [];
