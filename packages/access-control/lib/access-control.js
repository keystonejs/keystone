const { pick, defaultObj, intersection } = require('@keystonejs/utils');

const validateGranularConfigTypes = (parsedAccess, validateAccess) => {
  const errors = Object.entries(parsedAccess)
    .map(([accessType, access]) => validateAccess(typeof access, accessType))
    .filter(error => error);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
  return parsedAccess;
};

const parseAccessCore = ({ accessTypes, access, defaultAccess, onGranularParseError }) => {
  switch (typeof access) {
    case 'boolean':
    case 'function':
      return defaultObj(accessTypes, access);

    case 'object':
      // An object was supplied, but it has the wrong keys (it's probably a
      // declarative access control config being used as a shorthand, which
      // isn't possible [due to `create` not supporting declarative config])
      if (Object.keys(pick(access, accessTypes)).length === 0) {
        onGranularParseError();
      }
      return { ...defaultObj(accessTypes, defaultAccess), ...pick(access, accessTypes) };

    default:
      throw new Error(
        `Shorthand access must be specified as either a boolean or a function, received ${typeof access}.`
      );
  }
};

const parseAccess = ({ schemaNames, accessTypes, access, defaultAccess, parseAndValidate }) => {
  if (schemaNames.includes('internal')) {
    throw new Error(`"internal" is a reserved word and cannot be used as a schema name.`);
  }

  // Check that none of the schemaNames match the accessTypes
  if (intersection(schemaNames, accessTypes).length > 0) {
    throw new Error(
      `${JSON.stringify(
        intersection(schemaNames, accessTypes)
      )} are reserved words and cannot be used as schema names.`
    );
  }

  const providedNameCount = intersection(Object.keys(access), schemaNames).length;

  if (
    typeof access === 'object' &&
    providedNameCount > 0 &&
    providedNameCount < Object.keys(access).length
  ) {
    // If some are in, and some are out, throw an error!
    throw new Error(
      `Invalid schema names: ${JSON.stringify(
        Object.keys(access).filter(k => !schemaNames.includes(k))
      )}`
    );
  }

  const namesProvided =
    typeof access === 'object' && providedNameCount === Object.keys(access).length;
  return schemaNames.reduce(
    (acc, schemaName) => ({
      ...acc,
      [schemaName]: parseAndValidate(
        namesProvided
          ? access.hasOwnProperty(schemaName) // If all the keys are in schemaNames, parse each on their own
            ? access[schemaName]
            : defaultAccess
          : access
      ),
      internal: accessTypes.length ? defaultObj(accessTypes, true) : true,
    }),
    {}
  );
};

function parseCustomAccess({ defaultAccess, access = defaultAccess, schemaNames }) {
  const accessTypes = [];
  const parseAndValidate = access => {
    if (!['boolean', 'function', 'object'].includes(typeof access)) {
      throw new Error(
        `Expected a Boolean, Object, or Function for custom access, but got ${typeof access}`
      );
    }
    return access;
  };
  return parseAccess({ schemaNames, accessTypes, access, defaultAccess, parseAndValidate });
}

function parseListAccess({ listKey, defaultAccess, access = defaultAccess, schemaNames }) {
  const accessTypes = ['create', 'read', 'update', 'delete', 'auth'];
  const parseAndValidate = access => {
    const parsedAccess = parseAccessCore({
      accessTypes,
      access,
      defaultAccess,
      onGranularParseError: () => {
        throw new Error(
          `Must specify one of ${JSON.stringify(
            accessTypes
          )} access configs, but got ${JSON.stringify(
            Object.keys(access)
          )}. (Did you mean to specify a declarative access control config? This can be done on a granular basis only)`
        );
      },
    });
    const validateAccess = (type, accessType) => {
      if (accessType === 'create') {
        if (!['boolean', 'function'].includes(type)) {
          return `Expected a Boolean, or Function for ${listKey}.access.${accessType}, but got ${type}. (NOTE: 'create' cannot have a Declarative access control config)`;
        }
      } else {
        if (!['object', 'boolean', 'function'].includes(type)) {
          return `Expected a Boolean, Object, or Function for ${listKey}.access.${accessType}, but got ${type}`;
        }
      }
    };
    return validateGranularConfigTypes(parsedAccess, validateAccess);
  };
  return parseAccess({ schemaNames, accessTypes, access, defaultAccess, parseAndValidate });
}

function parseFieldAccess({
  listKey,
  fieldKey,
  defaultAccess,
  access = defaultAccess,
  schemaNames,
}) {
  const accessTypes = ['create', 'read', 'update'];
  const parseAndValidate = access => {
    const parsedAccess = parseAccessCore({
      accessTypes,
      access,
      defaultAccess,
      onGranularParseError: () => {
        throw new Error(
          `Must specify one of ${JSON.stringify(
            accessTypes
          )} access configs, but got ${JSON.stringify(
            Object.keys(access)
          )}. (Did you mean to specify a declarative access control config? This can be done on lists only)`
        );
      },
    });
    const validateAccess = (type, accessType) => {
      if (!['boolean', 'function'].includes(type)) {
        return `Expected a Boolean or Function for ${listKey}.fields.${fieldKey}.access.${accessType}, but got ${type}. (NOTE: Fields cannot have declarative access control config)`;
      }
    };
    return validateGranularConfigTypes(parsedAccess, validateAccess);
  };
  return parseAccess({ schemaNames, accessTypes, access, defaultAccess, parseAndValidate });
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
