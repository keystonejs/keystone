const inflection = require('inflection');

module.exports = class Field {
  constructor(path, config) {
    this.path = path;
    this.config = config;
    this.label = config.label || inflection.humanize(path);
  }
  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
};
