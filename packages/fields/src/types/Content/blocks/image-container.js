import path from 'path';
import image from './image';
import caption from './caption';

export default {
  type: 'image-container',
  viewPath: path.join(__dirname, '../views/blocks/image-container'),
  dependencies: [image, caption],
};
