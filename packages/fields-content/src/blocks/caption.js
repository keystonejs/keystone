import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class CaptionBlock extends Block {
  get type() {
    return 'caption';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/caption')];
  }
}
