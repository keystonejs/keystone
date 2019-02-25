const TextField = require('@voussoir/field-text');

module.exports = {
  ...TextField,
  type: 'Url',
  // Peer Dependency
  views: '@voussoir/admin-view-url',
};
