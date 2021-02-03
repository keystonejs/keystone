import Text from '../Text';
import CalendarDay from './';

export const name = 'CalendarDay';
export const type = CalendarDay;
export const exampleValue = () => '1990-12-31';
export const exampleValue2 = () => '2000-12-31';
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: { type: Text }, testField: { type } });

export const initItems = () => {
  return [
    { name: 'person1', testField: '1666-04-12' },
    { name: 'person2', testField: '1950-10-01' },
    { name: 'person3', testField: '1990-12-31' },
    { name: 'person4', testField: '2000-01-20' },
    { name: 'person5', testField: '2020-06-10' },
    { name: 'person6', testField: null },
    { name: 'person7' },
  ];
};

export const storedValues = () => [
  { name: 'person1', testField: '1666-04-12' },
  { name: 'person2', testField: '1950-10-01' },
  { name: 'person3', testField: '1990-12-31' },
  { name: 'person4', testField: '2000-01-20' },
  { name: 'person5', testField: '2020-06-10' },
  { name: 'person6', testField: null },
  { name: 'person7', testField: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
];
