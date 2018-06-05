const { getType, pick } = require('@keystonejs/utils');

const validateGranularConfigTypes = (longHandAccess, validationError) => {
  const errors = Object.entries(longHandAccess)
    .map(([accessType, accessConfig]) => {
      const type = getType(accessConfig);

      return validationError(type, accessType);
    })
    .filter(error => !!error);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
};

const shorthandToObject = (accessTypes, value) => {
  return accessTypes.reduce(
    (result, accessType) => ({
      ...result,
      [accessType]: value,
    }),
    {}
  );
};

const parseGranularAccessConfig = ({
  accessTypes,
  access,
  defaultAccess,
  onGranularParseError,
  validateGranularType,
}) => {
  const longHandAccess = pick(access, accessTypes);

  // An object was supplied, but it has the wrong keys (it's probably a
  // declarative access control config being used as a shorthand, which
  // isn't possible [due to `create` not supporting declarative config])
  if (Object.keys(longHandAccess).length === 0) {
    onGranularParseError();
  }

  validateGranularConfigTypes(longHandAccess, validateGranularType);

  // Construct an object with all keys
  return {
    ...shorthandToObject(accessTypes, defaultAccess),
    ...longHandAccess,
  };
};

const parseAccess = ({
  accessTypes,
  access,
  defaultAccess,
  onGranularParseError,
  validateGranularType,
}) => {
  const type = getType(access);
  switch (type) {
    case 'Boolean':
    case 'Function':
      return shorthandToObject(accessTypes, access);

    case 'Object':
      return parseGranularAccessConfig({
        accessTypes,
        access,
        defaultAccess,
        onGranularParseError,
        validateGranularType,
      });

    default:
      throw new Error(
        `Shorthand access must be specified as either a boolean or a function, received ${type}.`
      );
  }
};

module.exports = {
  parseListAccess({ listKey, defaultAccess, access = defaultAccess }) {
    const accessTypes = ['create', 'read', 'update', 'delete'];

    return parseAccess({
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
      validateGranularType: (type, accessType) => {
        if (accessType === 'create') {
          if (!['Boolean', 'Function'].includes(type)) {
            return `Expected a Boolean, or Function for ${listKey}.access.${accessType}, but got ${type}. (NOTE: 'create' cannot have a Declarative access control config)`;
          }
        } else {
          if (!['Object', 'Boolean', 'Function'].includes(type)) {
            return `Expected a Boolean, Object, or Function for ${listKey}.access.${accessType}, but got ${type}`;
          }
        }
      },
    });
  },

  parseFieldAccess({
    listKey,
    fieldKey,
    defaultAccess,
    access = defaultAccess,
  }) {
    const accessTypes = ['create', 'read', 'update'];

    return parseAccess({
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
      validateGranularType: (type, accessType) => {
        if (!['Boolean', 'Function'].includes(type)) {
          return `Expected a Boolean or Function for ${listKey}.fields.${fieldKey}.access.${accessType}, but got ${type}. (NOTE: Fields cannot have declarative access control config)`;
        }
      },
    });
  },

  mergeWhereClause(args, where) {
    if (getType(where) !== 'Object') {
      return args;
    }

    // Access control is a where clause type
    return {
      ...args,
      where: {
        ...args.where,
        ...where,
      },
    };
  },

  testListAccessControl({ access, listKey, operation, authentication }) {
    // Either a boolean or an object describing a where clause
    if (typeof access[operation] !== 'function') {
      return access[operation];
    }

    const result = access[operation]({
      authentication: authentication.item ? authentication : {},
    });

    const type = getType(result);

    if (!['Object', 'Boolean'].includes(type)) {
      throw new Error(
        `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${type}`
      );
    }

    // Special case for 'create' permission
    if (operation === 'create' && type === 'Object') {
      throw new Error(
        `Expected a Boolean for ${listKey}.access.create(), but got Object. (NOTE: 'create' cannot have a Declarative access control config)`
      );
    }

    return result;
  },

  testFieldAccessControl({
    access,
    listKey,
    fieldKey,
    item,
    operation,
    authentication,
  }) {
    if (typeof access[operation] !== 'function') {
      return access[operation];
    }

    const result = access[operation]({
      authentication: authentication.item ? authentication : {},
      item,
    });

    const type = getType(result);

    if (type !== 'Boolean') {
      throw new Error(
        `Must return a Boolean from ${listKey}.fields.${fieldKey}.access.${operation}(). Got ${type}`
      );
    }

    return result;
  },
};
