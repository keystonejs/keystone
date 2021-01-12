import isUrl from 'is-url';
import { Text } from 'slate';
import { ElementFromValidation } from './structure-validation';
export function validateNode(node: ElementFromValidation) {
  if (Text.isText(node)) {
    return true;
  }

  if (node.type === 'link') {
    if (!isUrl(node.href)) {
      return false;
    }
  }
}
