import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class LinkBlock extends Block {
  get type() {
    return 'link';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/link')];
  }
}
