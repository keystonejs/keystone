import path from 'path';
import listItem from './list-item';

export default {
  type: 'ordered-list',
  viewPath: path.join(__dirname, '../views/blocks/ordered-list'),
  dependencies: [listItem],
};
