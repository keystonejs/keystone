'use strict';
const path = require('path');

let parentModuleDirectory = path.dirname(module.parent.filename);

exports.importView = pathToImport => {
  return path.join(parentModuleDirectory, pathToImport);
};

// we need to delete the cache so that every time
// the module is required, a new version is used
// so we can get the correct parent module
delete require.cache[__filename];
