import { matchFilter } from '../../tests/fields.test';
import Text from '../Text';
import DateTime from './';

export const name = 'DateTime';

export const getTestFields = () => {
  return {
    name: { type: Text },
    lastOnline: { type: DateTime },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
    { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
    { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
    { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
    { name: 'person5', lastOnline: null },
  ];
};

export const filterTests = withKeystone => {
  const match = (server, filter, targets, forceSortBy = 'name') =>
    matchFilter(server, filter, '{ name, lastOnline }', targets, forceSortBy);

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline: "2000-01-20T00:08:00.000+10:00" }', [
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_not: "2000-01-20T00:08:00.000+10:00" }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline_not null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_not: null }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_lt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_lt: "1950-10-01T23:59:59.999-10:00" }', [
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_lte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_lte: "1950-10-01T23:59:59.999-10:00" }', [
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_gt',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_gt: "1950-10-01T23:59:59.999-10:00" }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_gte',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_gte: "1950-10-01T23:59:59.999-10:00" }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
      ])
    )
  );

  test(
    'Filter: lastOnline_in (empty list)',
    withKeystone(({ server: { server } }) => match(server, 'where: { lastOnline_in: [] }', []))
  );

  test(
    'Filter: lastOnline_not_in (empty list)',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_not_in: [] }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline_in',
    withKeystone(({ server: { server } }) =>
      match(
        server,
        'where: { lastOnline_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
        [
          { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
          { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
          { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        ]
      )
    )
  );

  test(
    'Filter: lastOnline_not_in',
    withKeystone(({ server: { server } }) =>
      match(
        server,
        'where: { lastOnline_not_in: ["1990-12-31T12:34:56.789+01:23", "2000-01-20T00:08:00.000+10:00", "1950-10-01T23:59:59.999-10:00"] }',
        [
          { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
          { name: 'person5', lastOnline: null },
        ]
      )
    )
  );

  test(
    'Filter: lastOnline_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_in: [null] }', [{ name: 'person5', lastOnline: null }])
    )
  );

  test(
    'Filter: lastOnline_not_in null',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { lastOnline_not_in: [null] }', [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
      ])
    )
  );

  test(
    'Sorting: orderBy: lastOnline_ASC',
    withKeystone(({ server: { server } }) =>
      match(
        server,
        'orderBy: "lastOnline_ASC"',
        [
          { name: 'person5', lastOnline: null },
          { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
          { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
          { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
          { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
        ],
        null
      )
    )
  );

  test(
    'Sorting: orderBy: lastOnline_DESC',
    withKeystone(({ server: { server } }) =>
      match(
        server,
        'orderBy: "lastOnline_DESC"',
        [
          { name: 'person2', lastOnline: '2000-01-20T00:08:00.000+10:00' },
          { name: 'person1', lastOnline: '1990-12-31T12:34:56.789+01:23' },
          { name: 'person3', lastOnline: '1950-10-01T23:59:59.999-10:00' },
          { name: 'person4', lastOnline: '1666-04-12T00:08:00.000+10:00' },
          { name: 'person5', lastOnline: null },
        ],
        null
      )
    )
  );
};
