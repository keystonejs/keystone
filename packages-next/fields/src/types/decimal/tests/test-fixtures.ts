import { DatabaseProvider } from '@keystone-next/types';
import { decimal } from '..';
import { text } from '../../text';

export const name = 'Decimal';
export const typeFunction = decimal;
export const exampleValue = () => '6.28';
export const exampleValue2 = () => '6.45';
export const supportsUnique = true;
export const fieldName = 'price';
export const unSupportedAdapterList = ['sqlite'];

export const getTestFields = () => ({
  name: text(),
  price: decimal({ scale: 2 }),
});

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
];
