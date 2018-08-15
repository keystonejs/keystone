import {
  parseListAccess,
  parseFieldAccess,
  mergeWhereClause,
  testListAccessControl,
  testFieldAccessControl,
} from './index.js';
describe('Access control package tests', () => {
  test('parseListAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;
    const where = { name: 'foo' }; // GraphQLWhere
    const whereFn = () => where; // (AccessInput => GraphQLWhere)
    const declaratives = [where, whereFn]; // type DeclarativeAccess = GraphQLWhere | (AccessInput => GraphQLWhere);

    // StaticAccess | ImperativeAccess are valid defaults
    [...statics, ...imperatives].forEach(defaultAccess => {
      expect(parseListAccess({ defaultAccess })).toEqual({
        create: defaultAccess,
        read: defaultAccess,
        update: defaultAccess,
        delete: defaultAccess,
      });
    });

    // Non-function declaratives and other misc values are not value inputs for defaultAccess
    [{ read: where }, 10].forEach(defaultAccess => {
      expect(() => parseListAccess({ defaultAccess })).toThrow(Error);
    });

    // StaticAccess | ImperativeAccess are valid access modes, and should override the defaults
    [...statics, ...imperatives].forEach(defaultAccess => {
      [...statics, ...imperatives].forEach(access => {
        expect(parseListAccess({ defaultAccess, access })).toEqual({
          create: access,
          read: access,
          update: access,
          delete: access,
        });
      });
    });

    // StaticAccess | ImperativeAccess | DeclarativeAccess are valid per-operation access modes
    [...statics, ...imperatives].forEach(defaultAccess => {
      [...statics, ...imperatives, ...declaratives].forEach(opAccess => {
        const access = { read: opAccess };
        expect(parseListAccess({ defaultAccess, access })).toEqual({
          create: defaultAccess,
          read: opAccess,
          update: defaultAccess,
          delete: defaultAccess,
        });
      });

      // Misc values are not valid per-operation access modes
      expect(() => parseListAccess({ defaultAccess, access: { read: 10 } })).toThrow(Error);
    });

    // StaticAccess | ImperativeAccess are valid per-operation access modes (create)
    [...statics, ...imperatives].forEach(defaultAccess => {
      [...statics, ...imperatives].forEach(opAccess => {
        const access = { create: opAccess };
        expect(parseListAccess({ defaultAccess, access })).toEqual({
          create: opAccess,
          read: defaultAccess,
          update: defaultAccess,
          delete: defaultAccess,
        });
      });

      // DeclarativeAccess | Misc values are not valid per-operation access modes (create)
      [where, 10].forEach(opAccess => {
        expect(() => parseListAccess({ defaultAccess, access: { create: opAccess } })).toThrow(
          Error
        );
      });
    });

    // access as an object with bad fields or bad type
    expect(() => parseListAccess({ access: { a: 1 } })).toThrow(Error);
    expect(() => parseListAccess({ access: 10 })).toThrow(Error);
  });

  test('parseFieldAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;

    // StaticAccess | ImperativeAccess are valid defaults
    [...statics, ...imperatives].forEach(defaultAccess => {
      expect(parseFieldAccess({ defaultAccess })).toEqual({
        create: defaultAccess,
        read: defaultAccess,
        update: defaultAccess,
      });
    });

    // Objects and other misc values are not value inputs for defaultAccess
    [{ a: 1 }, 10].forEach(defaultAccess => {
      expect(() => parseListAccess({ defaultAccess })).toThrow(Error);
    });

    // StaticAccess | ImperativeAccess are valid access modes, and should override the defaults
    [...statics, ...imperatives].forEach(defaultAccess => {
      [...statics, ...imperatives].forEach(access => {
        expect(parseFieldAccess({ defaultAccess, access })).toEqual({
          create: access,
          read: access,
          update: access,
        });
      });
    });

    // StaticAccess | ImperativeAccess are valid per-operation access modes
    [...statics, ...imperatives].forEach(defaultAccess => {
      [...statics, ...imperatives].forEach(opAccess => {
        const access = { read: opAccess };
        expect(parseFieldAccess({ defaultAccess, access })).toEqual({
          create: defaultAccess,
          read: opAccess,
          update: defaultAccess,
        });
      });

      // Misc values are not valid per-operation access modes
      expect(() => parseFieldAccess({ defaultAccess, access: { read: 10 } })).toThrow(Error);
    });

    expect(() => parseFieldAccess({ access: { a: 1 } })).toThrow(Error);
    expect(() => parseFieldAccess({ access: 10 })).toThrow(Error);
  });

  test('mergeWhereClause', () => {
    let args = { a: 1 };

    // Non-objects for where clause, simply return
    expect(mergeWhereClause(args, undefined)).toEqual(args);
    expect(mergeWhereClause(args, true)).toEqual(args);
    expect(mergeWhereClause(args, 10)).toEqual(args);

    let where = {};
    expect(mergeWhereClause(args, where)).toEqual({ a: 1, where: {} });

    where = { b: 20 };
    expect(mergeWhereClause(args, where)).toEqual({ a: 1, where: { b: 20 } });

    args = { a: 1, where: { b: 2, c: 3, d: 4 } };
    where = { b: 20, c: 30 };
    expect(mergeWhereClause(args, where)).toEqual({ a: 1, where: { b: 20, c: 30, d: 4 } });
  });

  test('testListAccessControl', () => {
    let operation = 'read';
    const access = { [operation]: true };
    const authentication = {};

    // Test the static case: returning a boolean
    expect(testListAccessControl({ access: { [operation]: true }, operation })).toBe(true);
    expect(testListAccessControl({ access: { [operation]: false }, operation })).toBe(false);
    expect(() => testListAccessControl({ access: { [operation]: 10 }, operation })).toThrow(Error);

    // Boolean function
    access[operation] = () => true;
    expect(
      testListAccessControl({
        access: { [operation]: () => true },
        operation,
        authentication,
      })
    ).toBe(true);
    expect(
      testListAccessControl({
        access: { [operation]: () => false },
        operation,
        authentication,
      })
    ).toBe(false);
    // Object function
    expect(
      testListAccessControl({
        access: { [operation]: () => ({ a: 1 }) },
        operation,
        authentication,
      })
    ).toEqual({ a: 1 });

    // Object function with create operation
    operation = 'create';
    expect(() =>
      testListAccessControl({
        access: { [operation]: () => ({ a: 1 }) },
        operation,
        authentication,
      })
    ).toThrow(Error);

    // Number function
    expect(() =>
      testListAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
    ).toThrow(Error);

    operation = 'read';
    authentication.item = {};

    // Boolean function
    access[operation] = () => true;
    expect(
      testListAccessControl({
        access: { [operation]: () => true },
        operation,
        authentication,
      })
    ).toBe(true);
    expect(
      testListAccessControl({
        access: { [operation]: () => false },
        operation,
        authentication,
      })
    ).toBe(false);
    // Object function
    expect(
      testListAccessControl({
        access: { [operation]: () => ({ a: 1 }) },
        operation,
        authentication,
      })
    ).toEqual({ a: 1 });

    // Object function with create operation
    operation = 'create';
    expect(() =>
      testListAccessControl({
        access: { [operation]: () => ({ a: 1 }) },
        operation,
        authentication,
      })
    ).toThrow(Error);

    // Number function
    expect(() =>
      testListAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
    ).toThrow(Error);
  });

  test('testFieldAccessControl', () => {
    const operation = 'read';
    const authentication = {};
    // Test the StaticAccess case: returning a boolean
    expect(testFieldAccessControl({ access: { [operation]: true }, operation })).toBe(true);
    expect(testFieldAccessControl({ access: { [operation]: false }, operation })).toBe(false);
    expect(() => testFieldAccessControl({ access: { [operation]: 10 }, operation })).toThrow(Error);

    // Test the ImperativeAccess case: a function which should return boolean
    expect(
      testFieldAccessControl({
        access: { [operation]: () => true },
        operation,
        authentication,
      })
    ).toBe(true);

    expect(
      testFieldAccessControl({
        access: { [operation]: () => false },
        operation,
        authentication,
      })
    ).toBe(false);

    expect(() =>
      testFieldAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
    ).toThrow(Error);

    authentication.item = {};
    expect(
      testFieldAccessControl({
        access: { [operation]: () => true },
        operation,
        authentication,
      })
    ).toBe(true);

    expect(
      testFieldAccessControl({
        access: { [operation]: () => false },
        operation,
        authentication,
      })
    ).toBe(false);

    expect(() =>
      testFieldAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
    ).toThrow(Error);
  });
});
