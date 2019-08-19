import {
  parseListAccess,
  parseFieldAccess,
  validateListAccessControl,
  validateFieldAccessControl,
} from '../';

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
      // NOTE: create is handled differently below
      ['read', 'update', 'delete'].forEach(operation => {
        [...statics, ...imperatives, ...declaratives].forEach(opAccess => {
          const access = { [operation]: opAccess };
          expect(parseListAccess({ defaultAccess, access })).toEqual({
            create: defaultAccess,
            read: defaultAccess,
            update: defaultAccess,
            delete: defaultAccess,
            // Override the specific operation we are trying
            ...{ [operation]: opAccess },
          });
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
      ['create', 'read', 'update'].forEach(operation => {
        [...statics, ...imperatives].forEach(opAccess => {
          const access = { [operation]: opAccess };
          expect(parseFieldAccess({ defaultAccess, access })).toEqual({
            create: defaultAccess,
            read: defaultAccess,
            update: defaultAccess,
            // Override the specific operation we are trying
            ...{ [operation]: opAccess },
          });
        });

        // Misc values are not valid per-operation access modes
        expect(() => parseFieldAccess({ defaultAccess, access: { [operation]: 10 } })).toThrow(
          Error
        );
      });
    });

    expect(() => parseFieldAccess({ access: { a: 1 } })).toThrow(Error);
    expect(() => parseFieldAccess({ access: 10 })).toThrow(Error);
  });

  test('validateListAccessControl', () => {
    let operation = 'read';
    const access = { [operation]: true };

    // Test the static case: returning a boolean
    expect(validateListAccessControl({ access: { [operation]: true }, operation })).toBe(true);
    expect(validateListAccessControl({ access: { [operation]: false }, operation })).toBe(false);
    expect(() => validateListAccessControl({ access: { [operation]: 10 }, operation })).toThrow(
      Error
    );

    const originalInput = {};
    const accessFn = jest.fn(() => true);

    validateListAccessControl({ access: { [operation]: accessFn }, operation, originalInput });

    expect(accessFn).toHaveBeenCalledTimes(1);
    expect(accessFn).toHaveBeenCalledWith(
      expect.objectContaining({
        originalInput,
      })
    );

    [{}, { item: {} }].forEach(authentication => {
      operation = 'read';

      // Boolean function
      access[operation] = () => true;
      expect(
        validateListAccessControl({
          access: { [operation]: () => true },
          operation,
          authentication,
        })
      ).toBe(true);
      expect(
        validateListAccessControl({
          access: { [operation]: () => false },
          operation,
          authentication,
        })
      ).toBe(false);
      // Object function
      expect(
        validateListAccessControl({
          access: { [operation]: () => ({ a: 1 }) },
          operation,
          authentication,
        })
      ).toEqual({ a: 1 });

      // Object function with create operation
      operation = 'create';
      expect(() =>
        validateListAccessControl({
          access: { [operation]: () => ({ a: 1 }) },
          operation,
          authentication,
        })
      ).toThrow(Error);

      // Number function
      expect(() =>
        validateListAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
      ).toThrow(Error);
    });
  });

  test('validateFieldAccessControl', () => {
    const operation = 'read';
    // Test the StaticAccess case: returning a boolean
    expect(validateFieldAccessControl({ access: { [operation]: true }, operation })).toBe(true);
    expect(validateFieldAccessControl({ access: { [operation]: false }, operation })).toBe(false);
    expect(() => validateFieldAccessControl({ access: { [operation]: 10 }, operation })).toThrow(
      Error
    );

    const originalInput = {};
    const existingItem = {};
    const accessFn = jest.fn(() => true);

    validateFieldAccessControl({
      access: { [operation]: accessFn },
      operation,
      originalInput,
      existingItem,
    });

    expect(accessFn).toHaveBeenCalledTimes(1);
    expect(accessFn).toHaveBeenCalledWith(
      expect.objectContaining({
        originalInput,
        existingItem,
      })
    );

    [{}, { item: {} }].forEach(authentication => {
      // Test the ImperativeAccess case: a function which should return boolean
      expect(
        validateFieldAccessControl({
          access: { [operation]: () => true },
          operation,
          authentication,
        })
      ).toBe(true);

      expect(
        validateFieldAccessControl({
          access: { [operation]: () => false },
          operation,
          authentication,
        })
      ).toBe(false);

      expect(() =>
        validateFieldAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
      ).toThrow(Error);
    });
  });
});
