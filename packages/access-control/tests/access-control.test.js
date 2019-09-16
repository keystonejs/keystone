import {
  parseListAccess,
  parseFieldAccess,
  validateListAccessControl,
  validateFieldAccessControl,
} from '../';

describe('Access control package tests', () => {
  describe('parseListAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;
    const where = { name: 'foo' }; // GraphQLWhere
    const whereFn = () => where; // (AccessInput => GraphQLWhere)
    const declaratives = [where, whereFn]; // type DeclarativeAccess = GraphQLWhere | (AccessInput => GraphQLWhere);
    const schemaNames = ['public'];

    test('StaticAccess | ImperativeAccess are valid defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        expect(parseListAccess({ defaultAccess, schemaNames })).toEqual({
          public: {
            create: defaultAccess,
            read: defaultAccess,
            update: defaultAccess,
            delete: defaultAccess,
            auth: defaultAccess,
          },
        });
      });
    });

    test('Non-function declaratives and other misc values are not value inputs for defaultAccess', () => {
      [{ read: where }, 10].forEach(defaultAccess => {
        expect(() => parseListAccess({ defaultAccess, schemaNames })).toThrow(Error);
      });
    });

    test('StaticAccess | ImperativeAccess are valid access modes, and should override the defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(access => {
          expect(parseListAccess({ defaultAccess, access, schemaNames })).toEqual({
            public: {
              create: access,
              read: access,
              update: access,
              delete: access,
              auth: access,
            },
          });
        });
      });
    });

    test('StaticAccess | ImperativeAccess | DeclarativeAccess are valid per-operation access modes', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        // NOTE: create is handled differently below
        ['read', 'update', 'delete', 'auth'].forEach(operation => {
          [...statics, ...imperatives, ...declaratives].forEach(opAccess => {
            const access = { [operation]: opAccess };
            expect(parseListAccess({ defaultAccess, access, schemaNames })).toEqual({
              public: {
                create: defaultAccess,
                read: defaultAccess,
                update: defaultAccess,
                delete: defaultAccess,
                auth: defaultAccess,
                // Override the specific operation we are trying
                ...{ [operation]: opAccess },
              },
            });
          });
        });

        // Misc values are not valid per-operation access modes
        expect(() => parseListAccess({ defaultAccess, access: { read: 10 }, schemaNames })).toThrow(
          Error
        );
      });
    });

    test('StaticAccess | ImperativeAccess are valid per-operation access modes (create)', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(opAccess => {
          const access = { create: opAccess };
          expect(parseListAccess({ defaultAccess, access, schemaNames })).toEqual({
            public: {
              create: opAccess,
              read: defaultAccess,
              update: defaultAccess,
              delete: defaultAccess,
              auth: defaultAccess,
            },
          });
        });

        // DeclarativeAccess | Misc values are not valid per-operation access modes (create)
        [where, 10].forEach(opAccess => {
          expect(() =>
            parseListAccess({ defaultAccess, access: { create: opAccess }, schemaNames })
          ).toThrow(Error);
        });
      });
    });

    test('access as an object with bad fields or bad type', () => {
      expect(() => parseListAccess({ access: { a: 1 }, schemaNames })).toThrow(Error);
      expect(() => parseListAccess({ access: 10, schemaNames })).toThrow(Error);
    });

    test('Schema names which match access types should throw', () => {
      expect(() => parseListAccess({ access: true, schemaNames: ['public', 'read'] })).toThrow(
        Error
      );
    });

    test('Schema names matching the access keys', () => {
      const schemaNames = ['public', 'internal'];
      const access = { public: true };
      const defaultAccess = false;
      expect(parseListAccess({ defaultAccess, access, schemaNames })).toEqual({
        public: { create: true, read: true, update: true, delete: true, auth: true },
        internal: { create: false, read: false, update: false, delete: false, auth: false },
      });
    });

    test('Access keys which dont match the schema keys should throw', () => {
      const schemaNames = ['public', 'internal'];
      const access = { public: true, missing: false };
      const defaultAccess = false;
      expect(() => parseListAccess({ defaultAccess, access, schemaNames })).toThrow(Error);
    });
  });

  describe('parseFieldAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;
    const schemaNames = ['public'];

    test('StaticAccess | ImperativeAccess are valid defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        expect(parseFieldAccess({ defaultAccess, schemaNames })).toEqual({
          public: {
            create: defaultAccess,
            read: defaultAccess,
            update: defaultAccess,
          },
        });
      });
    });

    test('Objects and other misc values are not value inputs for defaultAccess', () => {
      [{ a: 1 }, 10].forEach(defaultAccess => {
        expect(() => parseListAccess({ defaultAccess, schemaNames })).toThrow(Error);
      });
    });
    test('StaticAccess | ImperativeAccess are valid access modes, and should override the defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(access => {
          expect(parseFieldAccess({ defaultAccess, access, schemaNames })).toEqual({
            public: {
              create: access,
              read: access,
              update: access,
            },
          });
        });
      });
    });

    test('StaticAccess | ImperativeAccess are valid per-operation access modes', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        ['create', 'read', 'update'].forEach(operation => {
          [...statics, ...imperatives].forEach(opAccess => {
            const access = { [operation]: opAccess };
            expect(parseFieldAccess({ defaultAccess, access, schemaNames })).toEqual({
              public: {
                create: defaultAccess,
                read: defaultAccess,
                update: defaultAccess,
                // Override the specific operation we are trying
                ...{ [operation]: opAccess },
              },
            });
          });

          // Misc values are not valid per-operation access modes
          expect(() =>
            parseFieldAccess({ defaultAccess, access: { [operation]: 10 }, schemaNames })
          ).toThrow(Error);
        });
      });
    });

    test('Misc', () => {
      expect(() => parseFieldAccess({ access: { a: 1 }, schemaNames })).toThrow(Error);
      expect(() => parseFieldAccess({ access: 10, schemaNames })).toThrow(Error);
    });
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
