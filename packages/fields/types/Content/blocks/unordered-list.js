const path = require('path');
const listItem = require('./list-item');

module.exports = {
  type: 'unordered-list',
  viewPath: path.join(__dirname, '../views/blocks/unordered-list'),
  dependencies: [listItem],
};
