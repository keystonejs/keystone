import { matchFilter } from '../../tests/fields.test';
import Text from './';

export const name = 'Text';

export const getTestFields = () => {
  return {
    name: { type: Text },
  };
};

export const initItems = () => {
  return [
    { name: 'item 1' },
    { name: 'item 2 - end' },
    { name: '' },
    { name: 'thing 4 - END' },
    { name: 'ITEM 5 - end' },
  ];
};

export const filterTests = app => {
  const match = (filter, targets, done) => {
    matchFilter(
      app,
      filter,
      '{ name }',
      targets.map(name_ => {
        return { name: name_ };
      }),
      done,
      'name'
    );
  };

  test('No filter', done => {
    match(undefined, ['', 'ITEM 5 - end', 'item 1', 'item 2 - end', 'thing 4 - END'], done);
  });

  test('Empty filter', done => {
    match('where: { }', ['', 'ITEM 5 - end', 'item 1', 'item 2 - end', 'thing 4 - END'], done);
  });

  test('Filter: name', done => {
    match('where: { name: "thing 4 - END" }', ['thing 4 - END'], done);
  });

  test('Filter: name_not', done => {
    match(
      'where: { name_not: "thing 4 - END" }',
      ['', 'ITEM 5 - end', 'item 1', 'item 2 - end'],
      done
    );
  });

  test('Filter: name (case-sensitive) (hit)', done => {
    match('where: { name: "thing 4 - END", name_case_sensitive: true }', ['thing 4 - END'], done);
  });

  test('Filter: name_not (case-sensitive) (hit)', done => {
    match(
      'where: { name_not: "thing 4 - END", name_case_sensitive: true }',
      ['', 'ITEM 5 - end', 'item 1', 'item 2 - end'],
      done
    );
  });

  test('Filter: name (case-sensitive) (miss)', done => {
    match('where: { name: "thing 4 - end", name_case_sensitive: true }', [], done);
  });

  test('Filter: name_not (case-sensitive) (miss)', done => {
    match(
      'where: { name_not: "thing 4 - end", name_case_sensitive: true }',
      ['', 'ITEM 5 - end', 'item 1', 'item 2 - end', 'thing 4 - END'],
      done
    );
  });

  test('Filter: starts_with', done => {
    match('where: { name_starts_with: "item" }', ['ITEM 5 - end', 'item 1', 'item 2 - end'], done);
  });

  test('Filter: not_starts_with', done => {
    match('where: { name_not_starts_with: "item" }', ['', 'thing 4 - END'], done);
  });

  test('Filter: starts_with (case-sensitive)', done => {
    match(
      'where: { name_starts_with: "item", name_case_sensitive: true }',
      ['item 1', 'item 2 - end'],
      done
    );
  });

  test('Filter: not_starts_with (case-sensitive)', done => {
    match(
      'where: { name_not_starts_with: "item", name_case_sensitive: true }',
      ['', 'ITEM 5 - end', 'thing 4 - END'],
      done
    );
  });

  test('Filter: ends_with', done => {
    match(
      'where: { name_ends_with: "end" }',
      ['ITEM 5 - end', 'item 2 - end', 'thing 4 - END'],
      done
    );
  });

  test('Filter: not_ends_with', done => {
    match('where: { name_not_ends_with: "end" }', ['', 'item 1'], done);
  });

  test('Filter: ends_with (case-sensitive)', done => {
    match(
      'where: { name_ends_with: "end", name_case_sensitive: true }',
      ['ITEM 5 - end', 'item 2 - end'],
      done
    );
  });

  test('Filter: not_ends_with (case-sensitive)', done => {
    match(
      'where: { name_not_ends_with: "end", name_case_sensitive: true }',
      ['', 'item 1', 'thing 4 - END'],
      done
    );
  });

  test('Filter: contains', done => {
    match('where: { name_contains: "item" }', ['ITEM 5 - end', 'item 1', 'item 2 - end'], done);
  });

  test('Filter: not_contains', done => {
    match('where: { name_not_contains: "item" }', ['', 'thing 4 - END'], done);
  });

  test('Filter: contains (case-sensitive)', done => {
    match(
      'where: { name_contains: "item", name_case_sensitive: true }',
      ['item 1', 'item 2 - end'],
      done
    );
  });

  test('Filter: not_contains (case-sensitive)', done => {
    match(
      'where: { name_not_contains: "item", name_case_sensitive: true }',
      ['', 'ITEM 5 - end', 'thing 4 - END'],
      done
    );
  });

  test('Filter: in (empty list)', done => {
    match('where: { name_in: [] }', [], done);
  });

  test('Filter: not_in (empty list)', done => {
    match(
      'where: { name_not_in: [] }',
      ['', 'ITEM 5 - end', 'item 1', 'item 2 - end', 'thing 4 - END'],
      done
    );
  });

  test('Filter: in', done => {
    match(
      'where: { name_in: ["item 1", "thing 4 - END", "missing"] }',
      ['item 1', 'thing 4 - END'],
      done
    );
  });

  test('Filter: not_in', done => {
    match(
      'where: { name_not_in: ["item 1", "thing 4 - END", "missing"] }',
      ['', 'ITEM 5 - end', 'item 2 - end'],
      done
    );
  });

  test('Filter: in (case-sensitive)', done => {
    match(
      'where: { name_in: ["item 1", "THING 4 - END", "missing"], name_case_sensitive: true }',
      ['item 1'],
      done
    );
  });

  test('Filter: not_in (case-sensitive)', done => {
    match(
      'where: { name_not_in: ["item 1", "THING 4 - END", "missing"], name_case_sensitive: true }',
      ['', 'ITEM 5 - end', 'item 2 - end', 'thing 4 - END'],
      done
    );
  });
};
