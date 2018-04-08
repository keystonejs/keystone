const requiredConfig = {
  'cookie secret': 'You must provide a unique cookie secret to enable sessions',
};

const remapKeys = {
  'admin ui': 'adminUI',
};

const defaults = {
  adminPath: '/admin',
  port: 3000,
};

const camelize = str =>
  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });

const fixKeys = obj => {
  const rtn = {};
  Object.keys(obj).forEach(key => {
    if (remapKeys[key]) rtn[remapKeys[key]] = obj[key];
    else rtn[camelize(key)] = obj[key];
  });
  return rtn;
};

const checkRequired = config => {
  Object.keys(requiredConfig).forEach(key => {
    if (config[key] === undefined) throw requiredConfig[key];
  });
};

module.exports = function initConfig(config) {
  checkRequired(config);
  return {
    ...defaults,
    ...fixKeys(config),
  };
};
