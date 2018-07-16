import { matchFilter } from '../../tests/fields.test';
import Select from './';
import Text from '../Text';

export const name = 'Select';

export const getTestFields = () => {
  return {
    name: { type: Text }, // Provide a field to sort on
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
  };
};

export const initItems = () => {
  return [
    { company: 'thinkmill', name: 'a' },
    { company: 'atlassian', name: 'b' },
    { company: 'gelato', name: 'c' },
    { company: 'cete', name: 'd' },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(
      name,
      app,
      filter,
      '{ company name }',
      targets.map(x => {
        return x;
      }),
      done,
      'name' // Sort by name
    );
  };

  test('No filter', done => {
    match(
      undefined,
      [
        { company: 'thinkmill', name: 'a' },
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ],
      done
    );
  });

  test('Filter: company', done => {
    match(
      'where: { company: thinkmill }',
      [{ company: 'thinkmill', name: 'a' }],
      done
    );
  });

  test('Filter: company_not', done => {
    match(
      'where: { company_not: thinkmill }',
      [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ],
      done
    );
  });

  test('Filter: company_in', done => {
    match(
      'where: { company_in: [ atlassian, gelato ] }',
      [{ company: 'atlassian', name: 'b' }, { company: 'gelato', name: 'c' }],
      done
    );
  });

  test('Filter: company_not_in', done => {
    match(
      'where: { company_not_in: [ atlassian, gelato ] }',
      [{ company: 'thinkmill', name: 'a' }, { company: 'cete', name: 'd' }],
      done
    );
  });
};
