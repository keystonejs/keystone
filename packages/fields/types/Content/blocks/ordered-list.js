const path = require('path');
const listItem = require('./list-item');

module.exports = {
  type: 'ordered-list',
  viewPath: path.join(__dirname, '../views/blocks/ordered-list'),
  dependencies: [listItem],
};
