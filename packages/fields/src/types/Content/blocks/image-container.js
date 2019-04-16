import { importView } from '@keystone-alpha/build-field-types';
import image from './image';
import caption from './caption';

export default {
  type: 'image-container',
  viewPath: importView('../views/editor/blocks/image-container'),
  dependencies: [image, caption],
};
