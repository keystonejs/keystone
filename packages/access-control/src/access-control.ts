import { pick, defaultObj, intersection } from '@keystone-next/utils-legacy';

type MaybePromise<T> = T | Promise<T>;

type Static = boolean;
type Declarative = Record<string, any>;
type Imperative<T> = (args: T) => MaybePromise<Static | Declarative>;
type FieldImperative<T> = (args: T) => MaybePromise<Static>;

export type ListAccess<Args> = {
  create: Static | Declarative | Imperative<Args>;
  read: Static | Declarative | Imperative<Args>;
  update: Static | Declarative | Imperative<Args>;
  delete: Static | Declarative | Imperative<Args>;
};
export type AuthAccess<Args> = {
  auth: Static | Declarative | Imperative<Args>;
};
export type FieldAccess<Args> = {
  create: Static | FieldImperative<Args>;
  read: Static | FieldImperative<Args>;
  update: Static | FieldImperative<Args>;
};
// Note: Declarative here (custom) is really just Record<string,any> and is returned to the user
// to do whatever they want with...
export type CustomAccess<Args> = Static | Declarative | Imperative<Args>;

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

type ListAuthAccess<Args> = ListAccess<Args> & AuthAccess<Args>;
export function parseListAccess<SN extends string, Args>({
  listKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}: {
  listKey: string;
  defaultAccess: ListAccess<Args>['read'];
  access?:
    | Partial<Record<SN, Partial<ListAuthAccess<Args>> | ListAccess<Args>['read']>>
    | Partial<ListAuthAccess<Args>>
    | ListAccess<Args>['read'];
  schemaNames: SN[];
}) {
  const accessTypes = [
    'create',
    'read',
    'update',
    'delete',
    'auth',
  ] as (keyof ListAuthAccess<Args>)[];

  const keyedBySchemaName = checkSchemaNames({ schemaNames, accessTypes, access });

  type GG = Partial<ListAuthAccess<Args>> | ListAccess<Args>['read'];
  const fullAccess = keyedBySchemaName
    ? { ...defaultObj(schemaNames, defaultAccess), ...(access as Partial<Record<SN, GG>>) } // Access keyed by schemaName
    : defaultObj(schemaNames, access as GG | undefined); // Access not keyed by schemaName

  const parseAndValidate = (access: GG = {}) => {
    if (typeof access === 'boolean' || typeof access === 'function') {
      return defaultObj(accessTypes, access) as ListAccess<Args>['read'];
    } else if (typeof access === 'object') {
      const _access = access as Partial<ListAuthAccess<Args>>;
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
      {} as Record<SN, ListAuthAccess<Args>>
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

export function parseFieldAccess<SN extends string, Args>({
  listKey,
  fieldKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}: {
  listKey: string;
  fieldKey: string;
  defaultAccess: FieldAccess<Args>['read'];
  access?:
    | Partial<Record<SN, Partial<FieldAccess<Args>> | FieldAccess<Args>['read']>>
    | Partial<FieldAccess<Args>>
    | FieldAccess<Args>['read'];
  schemaNames: SN[];
}) {
  const accessTypes = ['create', 'read', 'update'] as (keyof FieldAccess<Args>)[];

  const keyedBySchemaName = checkSchemaNames({ schemaNames, accessTypes, access });

  type GG = Partial<FieldAccess<Args>> | FieldAccess<Args>['read'];
  const fullAccess = keyedBySchemaName
    ? { ...defaultObj(schemaNames, defaultAccess), ...(access as Partial<Record<SN, GG>>) } // Access keyed by schemaName
    : defaultObj(schemaNames, access as GG | undefined); // Access not keyed by schemaName

  const parseAndValidate = (access: GG = {}) => {
    if (typeof access === 'boolean' || typeof access === 'function') {
      return defaultObj(accessTypes, access);
    } else if (typeof access === 'object') {
      const _access = access as Partial<FieldAccess<Args>>;
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
      {} as Record<SN, FieldAccess<Args>>
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

export async function validateListAccessControl<
  Args extends { operation: keyof ListAccess<any>; listKey: string }
>({ access, args }: { access: ListAccess<Args>; args: Args }) {
  // Either a boolean or an object describing a where clause
  let result: Static | Declarative = false;
  const acc = access[args.operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc(args);
  }

  if (!['object', 'boolean'].includes(typeof result)) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }

  // Special case for 'create' permission
  if (args.operation === 'create' && typeof result === 'object') {
    throw new Error(
      `Expected a Boolean for ${args.listKey}.access.create(), but got Object. (NOTE: 'create' cannot have a Declarative access control config)`
    );
  }

  return result;
}

export async function validateFieldAccessControl<
  Args extends { operation: keyof FieldAccess<Args>; listKey: string; fieldKey: string }
>({ access, args }: { access: FieldAccess<Args>; args: Args }) {
  let result: boolean = false;
  const acc = access[args.operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc(args);
  }

  if (typeof result !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.fields.${args.fieldKey}.access.${
        args.operation
      }(). Got ${typeof result}`
    );
  }

  return result;
}

export async function validateAuthAccessControl<
  Args extends { operation: keyof AuthAccess<Args> }
>({ access, args }: { access: AuthAccess<Args>; args: Args }) {
  // Either a boolean or an object describing a where clause
  let result: Static | Declarative = false;
  const acc = access[args.operation];
  if (typeof acc !== 'function') {
    result = acc;
  } else {
    result = await acc(args);
  }

  if (!['object', 'boolean'].includes(typeof result)) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }

  return result;
}
