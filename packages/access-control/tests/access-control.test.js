import {
  parseListAccess,
  parseFieldAccess,
  parseCustomAccess,
  validateListAccessControl,
  validateFieldAccessControl,
  validateAuthAccessControl,
} from '../';

const internalAccess = {
  create: true,
  read: true,
  update: true,
  delete: true,
  auth: true,
};

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
          internal: internalAccess,
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
            internal: internalAccess,
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
              internal: internalAccess,
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
            internal: internalAccess,
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
    test('creating a `internal` schema should throw', () => {
      expect(() => parseListAccess({ access: true, schemaNames: ['public', 'internal'] })).toThrow(
        Error
      );
    });

    test('Schema names matching the access keys', () => {
      const schemaNames = ['public', 'private'];
      const access = { public: true };
      const defaultAccess = false;
      expect(parseListAccess({ defaultAccess, access, schemaNames })).toEqual({
        internal: internalAccess,
        public: { create: true, read: true, update: true, delete: true, auth: true },
        private: { create: false, read: false, update: false, delete: false, auth: false },
      });
    });

    test('Access keys which dont match the schema keys should throw', () => {
      const schemaNames = ['public', 'private'];
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
          internal: {
            create: true,
            read: true,
            update: true,
          },
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
            internal: {
              create: true,
              read: true,
              update: true,
            },
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
              internal: {
                create: true,
                read: true,
                update: true,
              },
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

  describe('parseCustomAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;
    const where = { name: 'foo' }; // GraphQLWhere
    const whereFn = () => where; // (AccessInput => GraphQLWhere)
    const declaratives = [where, whereFn]; // type DeclarativeAccess = GraphQLWhere | (AccessInput => GraphQLWhere);
    const schemaNames = ['public'];

    test('StaticAccess | ImperativeAccess are valid defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        expect(parseCustomAccess({ defaultAccess, schemaNames })).toEqual({
          internal: true,
          public: defaultAccess,
        });
      });
    });

    test('StaticAccess | ImperativeAccess | DeclarativeAccess are valid access modes, and should override the defaults', () => {
      [...statics, ...imperatives, ...declaratives].forEach(defaultAccess => {
        [...statics, ...imperatives, ...declaratives].forEach(access => {
          expect(parseCustomAccess({ defaultAccess, access, schemaNames })).toEqual({
            internal: true,
            public: access,
          });
        });

        // Misc values are not valid per-operation access modes
        expect(() => parseCustomAccess({ defaultAccess, access: 10, schemaNames })).toThrow(Error);
      });
    });

    test('Misc values are not value inputs for defaultAccess', () => {
      expect(() => parseCustomAccess({ defaultAccess: 10, schemaNames })).toThrow(Error);
    });

    test('Misc values are not value inputs for access', () => {
      expect(() => parseCustomAccess({ access: 10, schemaNames })).toThrow(Error);
    });

    test('Schema names matching the access keys', () => {
      const schemaNames = ['public', 'private'];
      const access = { public: true };
      const defaultAccess = false;
      expect(parseCustomAccess({ defaultAccess, access, schemaNames })).toEqual({
        internal: true,
        public: true,
        private: false,
      });
    });

    test('Access keys which dont match the schema keys should throw', () => {
      const schemaNames = ['public', 'private'];
      const access = { public: true, missing: false };
      const defaultAccess = false;
      expect(() => parseCustomAccess({ defaultAccess, access, schemaNames })).toThrow(Error);
    });
  });

  test('validateListAccessControl', async () => {
    let operation = 'read';
    const access = { [operation]: true };

    // Test the static case: returning a boolean
    await expect(
      validateListAccessControl({ access: { [operation]: true }, operation })
    ).resolves.toBe(true);
    await expect(
      validateListAccessControl({ access: { [operation]: false }, operation })
    ).resolves.toBe(false);
    await expect(
      validateListAccessControl({ access: { [operation]: 10 }, operation })
    ).rejects.toThrow(Error);

    const originalInput = {};
    const accessFn = jest.fn(() => true);

    await validateListAccessControl({
      access: { [operation]: accessFn },
      operation,
      originalInput,
    });

    expect(accessFn).toHaveBeenCalledTimes(1);
    expect(accessFn).toHaveBeenCalledWith(
      expect.objectContaining({
        originalInput,
      })
    );

    const items = [{}, { item: {} }];
    for (const authentication of items) {
      operation = 'read';

      // Boolean function
      access[operation] = () => true;
      await expect(
        validateListAccessControl({
          access: { [operation]: () => true },
          operation,
          authentication,
        })
      ).resolves.toBe(true);
      await expect(
        validateListAccessControl({
          access: { [operation]: () => false },
          operation,
          authentication,
        })
      ).resolves.toBe(false);
      // Object function
      await expect(
        validateListAccessControl({
          access: { [operation]: () => ({ a: 1 }) },
          operation,
          authentication,
        })
      ).resolves.toEqual({ a: 1 });

      // Object function with create operation
      operation = 'create';
      await expect(
        validateListAccessControl({
          access: { [operation]: () => ({ a: 1 }) },
          operation,
          authentication,
        })
      ).rejects.toThrow(Error);

      // Number function
      await expect(
        validateListAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
      ).rejects.toThrow(Error);
    }
  });

  test('validateFieldAccessControl', async () => {
    const operation = 'read';
    // Test the StaticAccess case: returning a boolean
    await expect(
      validateFieldAccessControl({ access: { [operation]: true }, operation })
    ).resolves.toBe(true);
    await expect(
      validateFieldAccessControl({ access: { [operation]: false }, operation })
    ).resolves.toBe(false);
    await expect(
      validateFieldAccessControl({ access: { [operation]: 10 }, operation })
    ).rejects.toThrow(Error);

    const originalInput = {};
    const existingItem = {};
    const accessFn = jest.fn(() => true);

    await validateFieldAccessControl({
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

    const items = [{}, { item: {} }];
    for (const authentication of items) {
      // Test the ImperativeAccess case: a function which should return boolean
      await expect(
        validateFieldAccessControl({
          access: { [operation]: () => true },
          operation,
          authentication,
        })
      ).resolves.toBe(true);

      await expect(
        validateFieldAccessControl({
          access: { [operation]: () => false },
          operation,
          authentication,
        })
      ).resolves.toBe(false);

      await expect(
        validateFieldAccessControl({ access: { [operation]: () => 10 }, operation, authentication })
      ).rejects.toThrow(Error);
    }
  });

  test('validateAuthAccessControl', async () => {
    let operation = 'auth';
    const access = { [operation]: true };

    // Test the static case: returning a boolean
    await expect(validateAuthAccessControl({ access: { [operation]: true } })).resolves.toBe(true);
    await expect(validateAuthAccessControl({ access: { [operation]: false } })).resolves.toBe(
      false
    );
    await expect(validateAuthAccessControl({ access: { [operation]: 10 } })).rejects.toThrow(Error);

    const accessFn = jest.fn(() => true);

    await validateAuthAccessControl({ access: { [operation]: accessFn } });

    expect(accessFn).toHaveBeenCalledTimes(1);

    const items = [{}, { item: {} }];
    for (const authentication of items) {
      operation = 'auth';

      // Boolean function
      access[operation] = () => true;
      await expect(
        validateAuthAccessControl({ access: { [operation]: () => true }, authentication })
      ).resolves.toBe(true);
      await expect(
        validateAuthAccessControl({ access: { [operation]: () => false }, authentication })
      ).resolves.toBe(false);
      // Object function
      await expect(
        validateAuthAccessControl({ access: { [operation]: () => ({ a: 1 }) }, authentication })
      ).resolves.toEqual({ a: 1 });

      // Object function with create operation
      operation = 'create';
      await expect(
        validateAuthAccessControl({ access: { [operation]: () => ({ a: 1 }) }, authentication })
      ).rejects.toThrow(Error);

      // Number function
      await expect(
        validateAuthAccessControl({ access: { [operation]: () => 10 }, authentication })
      ).rejects.toThrow(Error);
    }
  });
});
