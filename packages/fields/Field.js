const inflection = require('inflection');

module.exports = class Field {
  constructor(path, config) {
    this.path = path;
    this.config = config;
    this.label = config.label || inflection.humanize(path);
  }
  getAdminMeta() {
    return {
      label: this.label,
      path: this.path,
      type: this.constructor.name,
    };
  }
};
