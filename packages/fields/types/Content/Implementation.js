const { Text } = require('../Text/Implementation');

exports.Content = class Content extends Text {
  extendAdminMeta(meta) {
    return {
      ...meta,
      embedlyAPIKey: this.config.embedlyAPIKey,
    };
  }
};
