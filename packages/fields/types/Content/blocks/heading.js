const path = require('path');
const paragraph = require('./paragraph');

module.exports = {
  type: 'heading',
  viewPath: path.join(__dirname, '../views/blocks/heading'),
  dependencies: [paragraph],
};
