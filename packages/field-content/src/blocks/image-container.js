import { importView } from '@keystonejs/build-field-types';
import { Block } from '../Block';
import image from './image';
import caption from './caption';

export default class ImageContainerBlock extends Block {
  get type() {
    return 'image-container';
  }
  getAdminViews() {
    return [
      importView('../views/editor/blocks/image-container'),
      ...new image().getAdminViews(),
      ...new caption().getAdminViews(),
    ];
  }
}
