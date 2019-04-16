import path from 'path';
import paragraph from './paragraph';

export default {
  type: 'heading',
  viewPath: path.join(__dirname, '../views/blocks/heading'),
  dependencies: [paragraph],
};
