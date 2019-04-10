const path = require('path');
const image = require('./image');
const caption = require('./caption');

module.exports = {
  type: 'image-container',
  viewPath: path.join(__dirname, '../views/blocks/image-container'),
  dependencies: [image, caption],
};
