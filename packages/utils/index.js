const noop = () => {};

const camelize = (exports.camelize = str =>
  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  }));

exports.fixConfigKeys = (config, remapKeys = {}) => {
  const rtn = {};
  Object.keys(config).forEach(key => {
    if (remapKeys[key]) rtn[remapKeys[key]] = config[key];
    else rtn[camelize(key)] = config[key];
  });
  return rtn;
};

exports.checkRequiredConfig = (config, requiredKeys = {}) => {
  Object.keys(requiredKeys).forEach(key => {
    if (config[key] === undefined) throw requiredKeys[key];
  });
};

exports.escapeRegExp = str =>
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

exports.resolveAllKeys = obj => {
  const result = {};
  const allPromises = Object.keys(obj).map(key =>
    Promise.resolve(obj[key]).then(val => {
      result[key] = val;
    })
  );
  return Promise.all(allPromises).then(() => result);
};

exports.pick = (obj, keys) =>
  keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {});

function typeOf(obj) {
  return Object.prototype.toString.call(obj);
}

function parseObjectToACL(obj, { types, listKey, path = '' }) {
  return types.reduce((acl, type) => {
    if (!obj.hasOwnProperty(type)) {
      // Default to closed access
      acl[type] = false;
    } else if (
      ['[object Boolean]', '[object Function]'].indexOf(typeOf(obj[type])) !==
      -1
    ) {
      acl[type] = obj[type];
    } else {
      throw new Error(
        `Access type ${
          listKey ? `for ${listKey}${path ? `.${path}` : ''}.` : ''
        }access.${type} must be true/false, or a function.`
      );
    }
    return acl;
  }, {});
}

function parseFunctionToACL(func, types) {
  return types.reduce(
    (acl, type) => ({
      ...acl,
      [type]: func,
    }),
    {}
  );
}

function parseBooleanToACL(bool, types) {
  return types.reduce(
    (acl, type) => ({
      ...acl,
      [type]: bool,
    }),
    {}
  );
}

exports.parseACL = (obj, { accessTypes, listKey, path = '' }) => {
  if (obj === undefined) {
    // Default to full access when nothing set
    return parseBooleanToACL(true, accessTypes);
  }

  switch (typeOf(obj)) {
    case '[object Boolean]':
      return parseBooleanToACL(obj, accessTypes);
    case '[object Function]':
      return parseFunctionToACL(obj, accessTypes);
    case '[object Object]':
      return parseObjectToACL(obj, { accessTypes, listKey, path });
    default:
      throw new Error(
        `Access type ${
          listKey ? `for ${listKey}${path ? `.${path}` : ''}` : ''
        } must be true/false, a function, or an Object.`
      );
  }
};

exports.checkAccess = ({ access, dynamicCheckData = noop } = {}) => {
  return access && (typeof access !== 'function' || access(dynamicCheckData()));
};
