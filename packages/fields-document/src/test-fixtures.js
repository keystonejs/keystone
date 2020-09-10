import { getItems } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';
import { DocumentField } from './index';

const DOC1 = [{ type: 'paragraph', children: [{ text: 'other', bold: true }] }];
const DOC2 = [{ type: 'paragraph', children: [{ text: 'FOOBAR', bold: true }] }];
const DOC3 = [{ type: 'paragraph', children: [{ text: 'fooBAR', bold: true }] }];
const DOC4 = [{ type: 'paragraph', children: [{ text: 'foobar', bold: true }] }];

export const name = 'DocumentField';
export const type = DocumentField;
export const exampleValue = () => JSON.stringify(DOC1);
export const exampleValue2 = () => JSON.stringify(DOC2);
export const supportsUnique = false;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: { type: Text }, testField: { type } });

export const initItems = () => {
  return [
    // An empty string is not a correct DocumentField schema structure.
    // We have a pending TODO in the document field's implementation to revisit this.
    { name: 'a', testField: '' },
    { name: 'b', testField: JSON.stringify(DOC1) },
    { name: 'c', testField: JSON.stringify(DOC2) },
    { name: 'd', testField: JSON.stringify(DOC3) },
    { name: 'e', testField: JSON.stringify(DOC4) },
    { name: 'f', testField: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  // Updating document value with invalid string (e.g empty string) results in null.
  { name: 'a', testField: null },
  { name: 'b', testField: JSON.stringify(DOC1) },
  { name: 'c', testField: JSON.stringify(DOC2) },
  { name: 'd', testField: JSON.stringify(DOC3) },
  { name: 'e', testField: JSON.stringify(DOC4) },
  { name: 'f', testField: null },
  { name: 'g', testField: null },
];

export const supportedFilters = [
  'null_equality',
  'equality',
  'equality_case_insensitive',
  'in_empty_null',
  'in_value',
];

// Document field type doesn't support `start_with` and `ends_with`
export const filterTests = withKeystone => {
  const _storedValues = storedValues();
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({ keystone, listKey: 'Test', where, returnFields: 'name testField', sortBy })
    ).toEqual(expected.map(i => _storedValues[i]));

  test(
    `Contains`,
    withKeystone(({ keystone }) => match(keystone, { [`${fieldName}_contains`]: 'oo' }, [3, 4]))
  );

  test(
    `Contains - Case Insensitive`,
    withKeystone(({ keystone }) =>
      match(keystone, { [`${fieldName}_contains_i`]: 'oo' }, [2, 3, 4])
    )
  );

  test(
    `Not Contains`,
    withKeystone(({ keystone }) =>
      match(keystone, { [`${fieldName}_not_contains`]: 'oo' }, [0, 1, 2, 5, 6])
    )
  );

  test(
    `Not Contains - Case Insensitive`,
    withKeystone(({ keystone }) =>
      match(keystone, { [`${fieldName}_not_contains_i`]: 'oo' }, [0, 1, 5, 6])
    )
  );
};
