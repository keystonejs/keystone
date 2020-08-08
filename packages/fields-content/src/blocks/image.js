import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class ImageBlock extends Block {
  get type() {
    return 'image';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/image')];
  }
}
