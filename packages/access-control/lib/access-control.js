const { pick, defaultObj, intersection } = require('@keystonejs/utils');

const parseAccess = ({ schemaNames, accessTypes, access, defaultAccess }) => {
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

  const providedNameCount = intersection(Object.keys(access), schemaNames).length;

  if (
    typeof access === 'object' &&
    providedNameCount > 0 &&
    providedNameCount < Object.keys(access).length
  ) {
    // If some are in, and some are out, throw an error!
    const ks = Object.keys(access).filter(k => !schemaNames.includes(k));
    throw new Error(`Invalid schema names: ${JSON.stringify(ks)}`);
  }

  return typeof access === 'object' && providedNameCount === Object.keys(access).length
    ? { ...defaultObj(schemaNames, defaultAccess), ...access } // Access keyed by schemaName
    : defaultObj(schemaNames, access); // Access not keyed by schemaName
};

function parseCustomAccess({ defaultAccess, access = defaultAccess, schemaNames }) {
  const accessTypes = [];
  const fullAccess = parseAccess({ schemaNames, accessTypes, access, defaultAccess });
  const parseAndValidate = access => {
    if (!['boolean', 'function', 'object'].includes(typeof access)) {
      throw new Error(
        `Expected a Boolean, Object, or Function for custom access, but got ${typeof access}`
      );
    }
    return access;
  };
  return schemaNames.reduce(
    (acc, schemaName) => ({ ...acc, [schemaName]: parseAndValidate(fullAccess[schemaName]) }),
    { internal: true }
  );
}

function parseListAccess({ listKey, defaultAccess, access = defaultAccess, schemaNames }) {
  const accessTypes = ['create', 'read', 'update', 'delete', 'auth'];
  const fullAccess = parseAccess({ schemaNames, accessTypes, access, defaultAccess });
  const parseAndValidate = access => {
    let parsedAccess;
    switch (typeof access) {
      case 'boolean':
      case 'function':
        parsedAccess = defaultObj(accessTypes, access);
        break;
      case 'object':
        // An object was supplied, but it has the wrong keys (it's probably a
        // declarative access control config being used as a shorthand, which
        // isn't possible [due to `create` not supporting declarative config])
        if (Object.keys(pick(access, accessTypes)).length === 0) {
          const at = JSON.stringify(accessTypes);
          const aks = JSON.stringify(Object.keys(access));
          throw new Error(
            `Must specify one of ${at} access configs, but got ${aks}. (Did you mean to specify a declarative access control config? This can be done on a granular basis only)`
          );
        }
        parsedAccess = { ...defaultObj(accessTypes, defaultAccess), ...pick(access, accessTypes) };
        break;
      default:
        throw new Error(
          `Shorthand access must be specified as either a boolean or a function, received ${typeof access}.`
        );
    }
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
    return parsedAccess;
  };
  return schemaNames.reduce(
    (acc, schemaName) => ({ ...acc, [schemaName]: parseAndValidate(fullAccess[schemaName]) }),
    { internal: defaultObj(accessTypes, true) }
  );
}

function parseFieldAccess({
  listKey,
  fieldKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}) {
  const accessTypes = ['create', 'read', 'update'];
  const fullAccess = parseAccess({ schemaNames, accessTypes, access, defaultAccess });
  const parseAndValidate = access => {
    let parsedAccess;
    switch (typeof access) {
      case 'boolean':
      case 'function':
        parsedAccess = defaultObj(accessTypes, access);
        break;
      case 'object':
        // An object was supplied, but it has the wrong keys (it's probably a
        // declarative access control config being used as a shorthand, which
        // isn't possible [due to `create` not supporting declarative config])
        if (Object.keys(pick(access, accessTypes)).length === 0) {
          const at = JSON.stringify(accessTypes);
          const aks = JSON.stringify(Object.keys(access));
          throw new Error(
            `Must specify one of ${at} access configs, but got ${aks}. (Did you mean to specify a declarative access control config? This can be done on lists only)`
          );
        }
        parsedAccess = { ...defaultObj(accessTypes, defaultAccess), ...pick(access, accessTypes) };
        break;
      default:
        throw new Error(
          `Shorthand access must be specified as either a boolean or a function, received ${typeof access}.`
        );
    }
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
    return parsedAccess;
  };
  return schemaNames.reduce(
    (acc, schemaName) => ({ ...acc, [schemaName]: parseAndValidate(fullAccess[schemaName]) }),
    { internal: defaultObj(accessTypes, true) }
  );
}

async function validateCustomAccessControl({
  item,
  args,
  context,
  info,
  access,
  authentication = {},
  gqlName,
}) {
  // Either a boolean or an object describing a where clause
  let result;
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

async function validateListAccessControl({
  access,
  listKey,
  operation,
  authentication = {},
  originalInput,
  gqlName,
  itemId,
  itemIds,
  context,
}) {
  // Either a boolean or an object describing a where clause
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({
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

async function validateFieldAccessControl({
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
}) {
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({
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

async function validateAuthAccessControl({
  access,
  listKey,
  authentication = {},
  gqlName,
  context,
}) {
  const operation = 'auth';
  // Either a boolean or an object describing a where clause
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({
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

module.exports = {
  parseCustomAccess,
  parseListAccess,
  parseFieldAccess,
  validateCustomAccessControl,
  validateListAccessControl,
  validateFieldAccessControl,
  validateAuthAccessControl,
};
