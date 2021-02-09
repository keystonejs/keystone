import { pick, defaultObj, intersection } from '@keystonejs/utils';

type Static = boolean;
type Declarative = Record<string, any>;
type Imperative<T> = (args: T) => Promise<Static | Declarative>;
type FieldImperative<T> = (args: T) => Promise<Static>;

// FIXME: As more of Keystone becomes typed we will need to
// address the `any` fields here.
type Context = any;
type ListAccessArgs = {
  operation: keyof ListAccess;
  listKey: string;
  authentication: any;
  gqlName: string;
  context: Context;
  originalInput?: any;
  itemId?: any;
  itemIds?: any;
};
type FieldAccessArgs = {
  operation: keyof FieldAccess;
  listKey: string;
  fieldKey: string;
  originalInput: any;
  existingItem: any;
  authentication: any;
  gqlName: string;
  itemId: any;
  itemIds: any;
  context: Context;
};
type AuthAccessArgs = {
  operation: keyof AuthAccess;
  listKey: string;
  authentication: any;
  gqlName: string;
  context: Context;
};
type CustomAccessArgs = {
  item: any;
  args: any;
  context: Context;
  info: any;
  authentication: any;
  gqlName: string;
};

type ListAccess = {
  create: Static | Declarative | Imperative<ListAccessArgs>;
  read: Static | Declarative | Imperative<ListAccessArgs>;
  update: Static | Declarative | Imperative<ListAccessArgs>;
  delete: Static | Declarative | Imperative<ListAccessArgs>;
};
type AuthAccess = {
  auth: Static | Declarative | Imperative<AuthAccessArgs>;
};
type FieldAccess = {
  create: Static | FieldImperative<FieldAccessArgs>;
  read: Static | FieldImperative<FieldAccessArgs>;
  update: Static | FieldImperative<FieldAccessArgs>;
};

// Note: Declarative here (custom) is really just Record<string,any> and is returned to the user
// to do whatever they want with...
type CustomAccess = Static | Declarative | Imperative<CustomAccessArgs>;

const checkSchemaNames = ({
  schemaNames,
  accessTypes,
  access,
}: {
  schemaNames: string[];
  accessTypes: string[];
  access: any;
}) => {
  if (schemaNames.includes('internal')) {
    throw new Error(`"internal" is a reserved word and cannot be used as a schema name.`);
  }

  // Check that none of the schemaNames match the accessTypes
  const matchingNames = intersection(schemaNames, accessTypes);
  if (matchingNames.length > 0) {
    throw new Error(
      `${JSON.stringify(matchingNames)} are reserved words and cannot be used as schema names.`
    );
  }

  if (typeof access === 'object') {
    const accessKeys = Object.keys(access);
    const providedNameCount = intersection(accessKeys, schemaNames).length;
    if (providedNameCount > 0 && providedNameCount < accessKeys.length) {
      // If some are in, and some are out, throw an error!
      const ks = accessKeys.filter(k => !(schemaNames as readonly string[]).includes(k));
      throw new Error(`Invalid schema names: ${JSON.stringify(ks)}`);
    }
  }

  const keyedBySchemaName =
    typeof access === 'object' &&
    intersection(Object.keys(access), schemaNames).length === Object.keys(access).length;
  return keyedBySchemaName;
};

export function parseCustomAccess<SN extends string>({
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}: {
  defaultAccess: CustomAccess;
  access?: Partial<Record<SN, CustomAccess>> | CustomAccess;
  schemaNames: SN[];
}) {
  const accessTypes = [] as string[];

  const keyedBySchemaName = checkSchemaNames({ schemaNames, accessTypes, access });

  type GG = CustomAccess;
  const fullAccess = keyedBySchemaName
    ? { ...defaultObj(schemaNames, defaultAccess), ...(access as Partial<Record<SN, GG>>) } // Access keyed by schemaName
    : defaultObj(schemaNames, access as GG); // Access not keyed by schemaName

  const fullParsedAccess = { ...fullAccess, internal: true as const };

  Object.values(fullParsedAccess).forEach(access => {
    if (typeof access !== 'boolean' && typeof access !== 'function' && typeof access !== 'object') {
      throw new Error(
        `Expected a Boolean, Object, or Function for custom access, but got ${typeof access}`
      );
    }
  });

  return fullParsedAccess;
}

type ListAuthAccess = ListAccess & AuthAccess;
export function parseListAccess<SN extends string>({
  listKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}: {
  listKey: string;
  defaultAccess: ListAccess['read'];
  access?:
    | Partial<Record<SN, Partial<ListAuthAccess> | ListAccess['read']>>
    | Partial<ListAuthAccess>
    | ListAccess['read'];
  schemaNames: SN[];
}) {
  const accessTypes = ['create', 'read', 'update', 'delete', 'auth'] as (keyof ListAuthAccess)[];

  const keyedBySchemaName = checkSchemaNames({ schemaNames, accessTypes, access });

  type GG = Partial<ListAuthAccess> | ListAccess['read'];
  const fullAccess = keyedBySchemaName
    ? { ...defaultObj(schemaNames, defaultAccess), ...(access as Partial<Record<SN, GG>>) } // Access keyed by schemaName
    : defaultObj(schemaNames, access as GG | undefined); // Access not keyed by schemaName

  const parseAndValidate = (access: GG = {}) => {
    if (typeof access === 'boolean' || typeof access === 'function') {
      return defaultObj(accessTypes, access) as ListAccess['read'];
    } else if (typeof access === 'object') {
      const _access = access as Partial<ListAuthAccess>;
      if (Object.keys(pick(_access, accessTypes)).length === 0) {
        // An object was supplied, but it has the wrong keys (it's probably a
        // declarative access control config being used as a shorthand, which
        // isn't possible [due to `create` not supporting declarative config])
        const at = JSON.stringify(accessTypes);
        const aks = JSON.stringify(Object.keys(access));
        throw new Error(
          `Must specify one of ${at} access configs, but got ${aks}. (Did you mean to specify a declarative access control config? This can be done on a granular basis only)`
        );
      }
      return { ...defaultObj(accessTypes, defaultAccess), ...pick(_access, accessTypes) };
    } else {
      throw new Error(
        `Shorthand access must be specified as either a boolean or a function, received ${typeof access}.`
      );
    }
  };
  const fullParsedAccess = {
    ...schemaNames.reduce(
      (acc, schemaName) => ({ ...acc, [schemaName]: parseAndValidate(fullAccess[schemaName]) }),
      {} as Record<SN, ListAuthAccess>
    ),
    internal: defaultObj(accessTypes, true as const),
  };

  Object.values(fullParsedAccess).forEach(parsedAccess => {
    const errors = Object.entries(parsedAccess)
      .map(([accessType, access]) => {
        if (accessType === 'create') {
          if (!['boolean', 'function'].includes(typeof access)) {
            return `Expected a Boolean, or Function for ${listKey}.access.${accessType}, but got ${typeof access}. (NOTE: 'create' cannot have a Declarative access control config)`;
          }
        } else {
          if (!['object', 'boolean', 'function'].includes(typeof access)) {
            return `Expected a Boolean, Object, or Function for ${listKey}.access.${accessType}, but got ${typeof access}`;
          }
        }
      })
      .filter(error => error);

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  });

  return fullParsedAccess;
}

export function parseFieldAccess<SN extends string>({
  listKey,
  fieldKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}: {
  listKey: string;
  fieldKey: string;
  defaultAccess: FieldAccess['read'];
  access?:
    | Partial<Record<SN, Partial<FieldAccess> | FieldAccess['read']>>
    | Partial<FieldAccess>
    | FieldAccess['read'];
  schemaNames: SN[];
}) {
  const accessTypes = ['create', 'read', 'update'] as (keyof FieldAccess)[];

  const keyedBySchemaName = checkSchemaNames({ schemaNames, accessTypes, access });

  type GG = Partial<FieldAccess> | FieldAccess['read'];
  const fullAccess = keyedBySchemaName
    ? { ...defaultObj(schemaNames, defaultAccess), ...(access as Partial<Record<SN, GG>>) } // Access keyed by schemaName
    : defaultObj(schemaNames, access as GG | undefined); // Access not keyed by schemaName

  const parseAndValidate = (access: GG = {}) => {
    if (typeof access === 'boolean' || typeof access === 'function') {
      return defaultObj(accessTypes, access);
    } else if (typeof access === 'object') {
      const _access = access as Partial<FieldAccess>;
      if (Object.keys(pick(_access, accessTypes)).length === 0) {
        // An object was supplied, but it has the wrong keys (it's probably a
        // declarative access control config being used as a shorthand, which
        // isn't possible [due to `create` not supporting declarative config])
        const at = JSON.stringify(accessTypes);
        const aks = JSON.stringify(Object.keys(access));
        throw new Error(
          `Must specify one of ${at} access configs, but got ${aks}. (Did you mean to specify a declarative access control config? This can be done on lists only)`
        );
      }
      return { ...defaultObj(accessTypes, defaultAccess), ...pick(_access, accessTypes) };
    } else {
      throw new Error(
        `Shorthand access must be specified as either a boolean or a function, received ${typeof access}.`
      );
    }
  };
  const fullParsedAccess = {
    ...schemaNames.reduce(
      (acc, schemaName) => ({ ...acc, [schemaName]: parseAndValidate(fullAccess[schemaName]) }),
      {} as Record<SN, FieldAccess>
    ),
    internal: defaultObj(accessTypes, true as const),
  };

  Object.values(fullParsedAccess).forEach(parsedAccess => {
    const errors = Object.entries(parsedAccess)
      .map(([accessType, access]) => {
        if (!['boolean', 'function'].includes(typeof access)) {
          return `Expected a Boolean or Function for ${listKey}.fields.${fieldKey}.access.${accessType}, but got ${typeof access}. (NOTE: Fields cannot have declarative access control config)`;
        }
      })
      .filter(error => error);

    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  });

  return fullParsedAccess;
}

export async function validateCustomAccessControl({
  item,
  args,
  context,
  info,
  access,
  authentication = {},
  gqlName,
}: { access: CustomAccess } & CustomAccessArgs) {
  // Either a boolean or an object describing a where clause
  let result: Static | Declarative = false;
  if (typeof access !== 'function') {
    result = access;
  } else {
    result = await access({
      item,
      args,
      context,
      info,
      authentication: authentication.item ? authentication : {},
      gqlName,
    });
  }

  if (!['object', 'boolean'].includes(typeof result)) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }
  return result;
}

export async function validateListAccessControl({
  access,
  listKey,
  operation,
  authentication = {},
  originalInput,
  gqlName,
  itemId,
  itemIds,
  context,
}: { access: ListAccess } & ListAccessArgs) {
  // Either a boolean or an object describing a where clause
  let result: Static | Declarative = false;
  const acc = access[operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc({
      authentication: authentication.item ? authentication : {},
      listKey,
      operation,
      originalInput,
      gqlName,
      itemId,
      itemIds,
      context,
    });
  }

  if (!['object', 'boolean'].includes(typeof result)) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }

  // Special case for 'create' permission
  if (operation === 'create' && typeof result === 'object') {
    throw new Error(
      `Expected a Boolean for ${listKey}.access.create(), but got Object. (NOTE: 'create' cannot have a Declarative access control config)`
    );
  }

  return result;
}

export async function validateFieldAccessControl({
  access,
  listKey,
  fieldKey,
  originalInput,
  existingItem,
  operation,
  authentication = {},
  gqlName,
  itemId,
  itemIds,
  context,
}: { access: FieldAccess } & FieldAccessArgs) {
  let result: boolean = false;
  const acc = access[operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc({
      authentication: authentication.item ? authentication : {},
      listKey,
      fieldKey,
      originalInput,
      existingItem,
      operation,
      gqlName,
      itemId,
      itemIds,
      context,
    });
  }

  if (typeof result !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${listKey}.fields.${fieldKey}.access.${operation}(). Got ${typeof result}`
    );
  }

  return result;
}

export async function validateAuthAccessControl({
  access,
  listKey,
  authentication = {},
  gqlName,
  context,
}: { access: AuthAccess } & Omit<AuthAccessArgs, 'operation'>) {
  const operation = 'auth';
  // Either a boolean or an object describing a where clause
  let result: Static | Declarative = false;
  const acc = access[operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc({
      authentication: authentication.item ? authentication : {},
      listKey,
      operation,
      gqlName,
      context,
    });
  }

  if (!['object', 'boolean'].includes(typeof result)) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }

  return result;
}
