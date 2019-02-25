const TextField = require('@voussoir/field-text');

module.exports = {
  ...TextField,
  type: 'Color',
  // Peer Dependency
  views: '@voussoir/admin-view-color',
};
