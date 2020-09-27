import Text from '../Text';
import Decimal from './';

export const name = 'Decimal';
export const type = Decimal;
export const exampleValue = () => '6.28';
export const exampleValue2 = () => '6.45';
export const supportsUnique = true;
export const fieldName = 'price';
export const unSupportedAdapterList = ['prisma'];

export const getTestFields = () => ({
  name: { type: Text },
  price: { type, knexOptions: { scale: 2 } },
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

export const supportedFilters = [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
];
