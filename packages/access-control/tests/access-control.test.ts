import {
  parseListAccess,
  parseFieldAccess,
  parseCustomAccess,
  validateListAccessControl,
  validateFieldAccessControl,
  validateAuthAccessControl,
} from '../src';

const internalAccess = {
  create: true,
  read: true,
  update: true,
  delete: true,
  auth: true,
};

describe('Access control package tests', () => {
  describe('parseListAccess', () => {
    const listKey = 'key';
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [() => true, () => false]; // type ImperativeAccess = AccessInput => boolean;
    const where = { name: 'foo' }; // GraphQLWhere
    const whereFn = () => where; // (AccessInput => GraphQLWhere)
    const declaratives = [where, whereFn]; // type DeclarativeAccess = GraphQLWhere | (AccessInput => GraphQLWhere);
    const schemaNames = ['public'];

    test('StaticAccess | ImperativeAccess are valid defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        expect(parseListAccess({ listKey, defaultAccess, schemaNames })).toEqual({
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
        // @ts-ignore
        expect(() => parseListAccess({ listKey, defaultAccess, schemaNames })).toThrow(Error);
      });
    });

    test('StaticAccess | ImperativeAccess are valid access modes, and should override the defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(access => {
          expect(parseListAccess({ listKey, defaultAccess, access, schemaNames })).toEqual({
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
            expect(parseListAccess({ listKey, defaultAccess, access, schemaNames })).toEqual({
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
        expect(() =>
          parseListAccess({ listKey, defaultAccess, access: { read: 10 }, schemaNames })
        ).toThrow(Error);
      });
    });

    test('StaticAccess | ImperativeAccess are valid per-operation access modes (create)', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(opAccess => {
          const access = { create: opAccess };
          expect(parseListAccess({ listKey, defaultAccess, access, schemaNames })).toEqual({
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
            parseListAccess({ listKey, defaultAccess, access: { create: opAccess }, schemaNames })
          ).toThrow(Error);
        });
      });
    });

    test('access as an object with bad fields or bad type', () => {
      // @ts-ignore
      expect(() => parseListAccess({ listKey, access: { a: 1 }, schemaNames })).toThrow(Error);
      // @ts-ignore
      expect(() => parseListAccess({ listKey, access: 10, schemaNames })).toThrow(Error);
    });

    test('Schema names which match access types should throw', () => {
      expect(() =>
        parseListAccess({
          listKey,
          defaultAccess: true,
          access: true,
          schemaNames: ['public', 'read'],
        })
      ).toThrow(Error);
    });

    test('creating a `internal` schema should throw', () => {
      expect(() =>
        parseListAccess({
          listKey,
          defaultAccess: true,
          access: true,
          schemaNames: ['public', 'internal'],
        })
      ).toThrow(Error);
    });

    test('Schema names matching the access keys', () => {
      const schemaNames = ['public', 'private'];
      const access = { public: true };
      const defaultAccess = false;
      expect(parseListAccess({ listKey, defaultAccess, access, schemaNames })).toEqual({
        internal: internalAccess,
        public: { create: true, read: true, update: true, delete: true, auth: true },
        private: { create: false, read: false, update: false, delete: false, auth: false },
      });
    });

    test('Access keys which dont match the schema keys should throw', () => {
      const schemaNames = ['public', 'private'];
      const access = { public: true, missing: false };
      const defaultAccess = false;
      expect(() => parseListAccess({ listKey, defaultAccess, access, schemaNames })).toThrow(Error);
    });
  });

  describe('parseFieldAccess', () => {
    const statics = [true, false]; // type StaticAccess = boolean;
    const imperatives = [async () => true, async () => false]; // type ImperativeAccess = AccessInput => boolean;
    const schemaNames = ['public'];

    test('StaticAccess | ImperativeAccess are valid defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        expect(
          parseFieldAccess({ defaultAccess, schemaNames, listKey: 'listKey', fieldKey: 'fieldKey' })
        ).toEqual({
          internal: { create: true, read: true, update: true },
          public: { create: defaultAccess, read: defaultAccess, update: defaultAccess },
        });
      });
    });

    test('Objects and other misc values are not value inputs for defaultAccess', () => {
      [{ a: 1 }, 10].forEach(defaultAccess => {
        expect(() =>
          // @ts-ignore
          parseListAccess({ listKey: 'lisKey', fieldKey: 'fieldKey', defaultAccess, schemaNames })
        ).toThrow(Error);
      });
    });

    test('StaticAccess | ImperativeAccess are valid access modes, and should override the defaults', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        [...statics, ...imperatives].forEach(access => {
          expect(
            parseFieldAccess({
              defaultAccess,
              access,
              schemaNames,
              listKey: 'listKey',
              fieldKey: 'fieldKey',
            })
          ).toEqual({
            internal: { create: true, read: true, update: true },
            public: { create: access, read: access, update: access },
          });
        });
      });
    });

    test('StaticAccess | ImperativeAccess are valid per-operation access modes', () => {
      [...statics, ...imperatives].forEach(defaultAccess => {
        ['create', 'read', 'update'].forEach(operation => {
          [...statics, ...imperatives].forEach(opAccess => {
            const access = { [operation]: opAccess };
            expect(
              parseFieldAccess({
                defaultAccess,
                access,
                schemaNames,
                listKey: 'listKey',
                fieldKey: 'fieldKey',
              })
            ).toEqual({
              internal: { create: true, read: true, update: true },
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
            parseFieldAccess({
              defaultAccess,
              access: { [operation]: 10 },
              schemaNames,
              listKey: 'listKey',
              fieldKey: 'fieldKey',
            })
          ).toThrow(Error);
        });
      });
    });

    test('Misc', () => {
      expect(() =>
        parseFieldAccess({
          defaultAccess: true,
          // @ts-ignore
          access: { a: 1 },
          schemaNames,
          listKey: 'listKey',
          fieldKey: 'fieldKey',
        })
      ).toThrow(Error);
      expect(() =>
        parseFieldAccess({
          defaultAccess: true,
          // @ts-ignore
          access: 10,
          schemaNames,
          listKey: 'listKey',
          fieldKey: 'fieldKey',
        })
      ).toThrow(Error);
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
        // @ts-ignore
        expect(() => parseCustomAccess({ defaultAccess, access: 10, schemaNames })).toThrow(Error);
      });
    });

    test('Misc values are not value inputs for defaultAccess', () => {
      // @ts-ignore
      expect(() => parseCustomAccess({ defaultAccess: 10, schemaNames })).toThrow(Error);
    });

    test('Misc values are not value inputs for access', () => {
      // @ts-ignore
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
    const operation = 'read' as const;
    const access = { [operation]: true as boolean | (() => Promise<boolean>) };
    const _access = { create: false, update: false, delete: false };
    // Test the static case: returning a boolean
    const listArgs = {
      listKey: 'listKey',
      authentication: {},
      gqlName: 'gqlName',
      context: {},
    };
    await expect(
      validateListAccessControl({
        access: { [operation]: true, ..._access },
        operation,
        ...listArgs,
      })
    ).resolves.toBe(true);
    await expect(
      validateListAccessControl({
        access: { [operation]: false, ..._access },
        operation,
        ...listArgs,
      })
    ).resolves.toBe(false);
    await expect(
      // @ts-ignore
      validateListAccessControl({ access: { [operation]: 10, ..._access }, operation, ...listArgs })
    ).rejects.toThrow(Error);

    const originalInput = {};
    const accessFn = jest.fn(() => true);

    await validateListAccessControl({
      access: { [operation]: accessFn, ..._access },
      operation,
      ...listArgs,
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
      // Boolean function
      access[operation] = async () => true;
      await expect(
        validateListAccessControl({
          access: { [operation]: () => true, ..._access },
          operation,
          ...listArgs,
          authentication,
        })
      ).resolves.toBe(true);
      await expect(
        validateListAccessControl({
          access: { [operation]: () => false, ..._access },
          operation,
          ...listArgs,
          authentication,
        })
      ).resolves.toBe(false);
      // Object function
      await expect(
        validateListAccessControl({
          access: { [operation]: () => ({ a: 1 }), ..._access },
          operation,
          ...listArgs,
          authentication,
        })
      ).resolves.toEqual({ a: 1 });

      // Object function with create operation
      await expect(
        validateListAccessControl({
          // @ts-ignore
          access: { create: () => ({ a: 1 }) },
          operation: 'create',
          ...listArgs,
          authentication,
        })
      ).rejects.toThrow(Error);

      // Number function
      await expect(
        validateListAccessControl({
          // @ts-ignore
          access: { create: () => 10 },
          operation: 'create',
          ...listArgs,
          authentication,
        })
      ).rejects.toThrow(Error);
    }
  });

  test('validateFieldAccessControl', async () => {
    const operation = 'read' as const;
    // Test the StaticAccess case: returning a boolean
    const _access = { create: false, update: false };
    const fieldArgs = {
      operation,
      listKey: 'listKey',
      fieldKey: 'fieldKey',
      originalInput: {},
      existingItem: {},
      authentication: {},
      gqlName: 'gqlName',
      itemId: {},
      itemIds: [],
      context: {},
    };
    await expect(
      validateFieldAccessControl({ access: { [operation]: true, ..._access }, ...fieldArgs })
    ).resolves.toBe(true);
    await expect(
      validateFieldAccessControl({ access: { [operation]: false, ..._access }, ...fieldArgs })
    ).resolves.toBe(false);
    await expect(
      // @ts-ignore
      validateFieldAccessControl({ access: { [operation]: 10, ..._access }, ...fieldArgs })
    ).rejects.toThrow(Error);

    const originalInput = {};
    const existingItem = {};
    const accessFn = jest.fn(async () => true);

    await validateFieldAccessControl({
      access: { [operation]: accessFn, ..._access },
      ...fieldArgs,
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
          access: { [operation]: async () => true, ..._access },
          ...fieldArgs,
          authentication,
        })
      ).resolves.toBe(true);

      await expect(
        validateFieldAccessControl({
          access: { [operation]: async () => false, ..._access },
          ...fieldArgs,
          authentication,
        })
      ).resolves.toBe(false);

      await expect(
        validateFieldAccessControl({
          // @ts-ignore
          access: { [operation]: () => 10, ..._access },
          ...fieldArgs,
          authentication,
        })
      ).rejects.toThrow(Error);
    }
  });

  test('validateAuthAccessControl', async () => {
    const operation = 'auth';
    // Test the static case: returning a boolean
    const authArgs = { listKey: 'listKey', authentication: {}, gqlName: 'gqlName', context: {} };
    await expect(
      validateAuthAccessControl({ access: { [operation]: true }, ...authArgs })
    ).resolves.toBe(true);
    await expect(
      validateAuthAccessControl({ access: { [operation]: false }, ...authArgs })
    ).resolves.toBe(false);
    await expect(
      // @ts-ignore
      validateAuthAccessControl({ access: { [operation]: 10 }, ...authArgs })
    ).rejects.toThrow(Error);

    const accessFn = jest.fn(() => true);

    await validateAuthAccessControl({ access: { [operation]: accessFn }, ...authArgs });

    expect(accessFn).toHaveBeenCalledTimes(1);

    const items = [{}, { item: {} }];
    for (const authentication of items) {
      // Boolean function
      await expect(
        validateAuthAccessControl({
          access: { [operation]: () => true },
          ...authArgs,
          authentication,
        })
      ).resolves.toBe(true);
      await expect(
        validateAuthAccessControl({
          access: { [operation]: () => false },
          ...authArgs,
          authentication,
        })
      ).resolves.toBe(false);
      // Object function
      await expect(
        validateAuthAccessControl({
          access: { [operation]: () => ({ a: 1 }) },
          ...authArgs,
          authentication,
        })
      ).resolves.toEqual({ a: 1 });

      // Object function with create operation
      await expect(
        validateAuthAccessControl({
          // @ts-ignore
          access: { create: () => ({ a: 1 }) },
          ...authArgs,
          authentication,
        })
      ).rejects.toThrow(Error);

      // Number function
      await expect(
        // @ts-ignore
        validateAuthAccessControl({ access: { create: () => 10 }, ...authArgs, authentication })
      ).rejects.toThrow(Error);
    }
  });
});
