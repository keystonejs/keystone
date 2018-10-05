import { matchFilter } from '../../tests/fields.test';
import Text from './';

const fieldType = 'Text';
export { fieldType as name };

export const getTestFields = () => {
  return {
    name: { type: Text },
  };
};

export const initItems = () => {
  return [
    { name: '' },
    { name: 'other' },
    { name: 'FOOBAR' },
    { name: 'fooBAR' },
    { name: 'foobar' },
    { name: null },
    {},
  ];
};

// JM: These tests are Mongo/Mongoose specific due to null handling (filtering and ordering)
// See https://github.com/keystonejs/keystone-5/issues/391

export const filterTests = app => {
  const match = (gqlArgs, targets, done) => {
    gqlArgs = (gqlArgs || '') + ' orderBy: "name"';
    matchFilter(app, gqlArgs, '{ name }', targets.map(name => ({ name })), done);
  };

  test(`No 'where' argument`, done => {
    match('', [null, null, '', 'FOOBAR', 'fooBAR', 'foobar', 'other'], done);
  });
  test(`Empty 'where' argument'`, done => {
    match('where: { }', [null, null, '', 'FOOBAR', 'fooBAR', 'foobar', 'other'], done);
  });

  test(`Filter: {key} (case-sensitive)`, done => {
    match('where: { name: "fooBAR" }', ['fooBAR'], done);
  });
  test(`Filter: {key}_i (case-insensitive)`, done => {
    match('where: { name_i: "fooBAR" }', ['FOOBAR', 'fooBAR', 'foobar'], done);
  });

  test(`Filter: {key}_not (case-sensitive)`, done => {
    match('where: { name_not: "fooBAR" }', [null, null, '', 'FOOBAR', 'foobar', 'other'], done);
  });
  test(`Filter: {key}_not_i (case-insensitive)`, done => {
    match('where: { name_not_i: "fooBAR" }', [null, null, '', 'other'], done);
  });

  test(`Filter: {key}_contains (case-sensitive)`, done => {
    match('where: { name_contains: "oo" }', ['fooBAR', 'foobar'], done);
  });
  test(`Filter: {key}_contains_i (case-insensitive)`, done => {
    match('where: { name_contains_i: "oo" }', ['FOOBAR', 'fooBAR', 'foobar'], done);
  });

  test(`Filter: {key}_not_contains (case-sensitive)`, done => {
    match('where: { name_not_contains: "oo" }', [null, null, '', 'FOOBAR', 'other'], done);
  });
  test(`Filter: {key}_not_contains_i (case-insensitive)`, done => {
    match('where: { name_not_contains_i: "oo" }', [null, null, '', 'other'], done);
  });

  test(`Filter: {key}_starts_with (case-sensitive)`, done => {
    match('where: { name_starts_with: "foo" }', ['fooBAR', 'foobar'], done);
  });
  test(`Filter: {key}_starts_with_i (case-insensitive)`, done => {
    match('where: { name_starts_with_i: "foo" }', ['FOOBAR', 'fooBAR', 'foobar'], done);
  });

  test(`Filter: {key}_not_starts_with (case-sensitive)`, done => {
    match('where: { name_not_starts_with: "foo" }', [null, null, '', 'FOOBAR', 'other'], done);
  });
  test(`Filter: {key}_not_starts_with_i (case-insensitive)`, done => {
    match('where: { name_not_starts_with_i: "foo" }', [null, null, '', 'other'], done);
  });

  test(`Filter: {key}_ends_with (case-sensitive)`, done => {
    match('where: { name_ends_with: "BAR" }', ['FOOBAR', 'fooBAR'], done);
  });
  test(`Filter: {key}_ends_with_i (case-insensitive)`, done => {
    match('where: { name_ends_with_i: "BAR" }', ['FOOBAR', 'fooBAR', 'foobar'], done);
  });

  test(`Filter: {key}_not_ends_with (case-sensitive)`, done => {
    match('where: { name_not_ends_with: "BAR" }', [null, null, '', 'foobar', 'other'], done);
  });
  test(`Filter: {key}_not_ends_with_i (case-insensitive)`, done => {
    match('where: { name_not_ends_with_i: "BAR" }', [null, null, '', 'other'], done);
  });

  test(`Filter: {key}_in (case-sensitive, empty list)`, done => {
    match('where: { name_in: [] }', [], done);
  });
  test(`Filter: {key}_in (case-sensitive)`, done => {
    match('where: { name_in: ["", "FOOBAR"] }', ['', 'FOOBAR'], done);
  });

  test(`Filter: {key}_not_in (case-sensitive, empty list)`, done => {
    match(
      'where: { name_not_in: [] }',
      [null, null, '', 'FOOBAR', 'fooBAR', 'foobar', 'other'],
      done
    );
  });
  test(`Filter: {key}_not_in (case-sensitive)`, done => {
    match(
      'where: { name_not_in: ["", "FOOBAR"] }',
      [null, null, 'fooBAR', 'foobar', 'other'],
      done
    );
  });
};
