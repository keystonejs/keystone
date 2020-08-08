import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class ParagraphBlock extends Block {
  get type() {
    return 'paragraph';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/paragraph')];
  }
}
