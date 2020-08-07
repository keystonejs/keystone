import { resolveView } from '../resolve-view';
import { Block } from '../Block';

export default class ListItemBlock extends Block {
  get type() {
    return 'list-item';
  }
  getAdminViews() {
    return [resolveView('views/editor/blocks/list-item')];
  }
}
