import { password } from '../..';

export const name = 'Password with isNullable: false';
export const typeFunction = (x: any) => password({ ...x, db: { ...x?.db, isNullable: false } });
export const exampleValue = () => 'password';
export const exampleValue2 = () => 'password2';
export const supportsUnique = false;
export const supportsDbMap = true;
export const fieldName = 'password';
export const subfieldName = 'isSet';
export const skipCreateTest = true;
export const skipUpdateTest = true;

export const getTestFields = () => ({
  password: password({ validation: { length: { min: 4 } }, db: { isNullable: false } }),
});

export const initItems = () => {
  return [
    { name: 'person1', password: 'pass1' },
    { name: 'person2', password: 'passasdasdas' },
    { name: 'person3', password: 'pass3' },
    { name: 'person4', password: 'pass3' },
    { name: 'person5', password: 'pass3' },
    { name: 'person6', password: 'pass4' },
    { name: 'person7', password: 'pass5' },
  ];
};

export const storedValues = () => [
  { name: 'person1', password: { isSet: true } },
  { name: 'person2', password: { isSet: true } },
  { name: 'person3', password: { isSet: true } },
  { name: 'person4', password: { isSet: true } },
  { name: 'person5', password: { isSet: true } },
  { name: 'person6', password: { isSet: true } },
  { name: 'person7', password: { isSet: true } },
];

export const supportedFilters = () => [];
