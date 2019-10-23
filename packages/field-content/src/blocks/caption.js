import { importView } from '@keystone/build-field-types';
import { Block } from '../Block';

export default class CaptionBlock extends Block {
  get type() {
    return 'caption';
  }
  getAdminViews() {
    return [importView('../views/editor/blocks/caption')];
  }
}
