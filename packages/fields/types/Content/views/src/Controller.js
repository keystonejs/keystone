// TODO: This is a bit of a mess, and won't work when we split Content
// out into its own package. But the build process doesn't understand
// how to traverse preconstruct's src pointers yet, when it does this
// should import from '@keystone-alpha/fields/types/Text/views/Controller'
import TextController from '../../../Text/views/Controller/Controller';

export default class ContentController extends TextController {
  getValue = data => {
    const { path } = this.config;
    if (!data || !data[path] || !data[path].document) {
      // Forcibly return null if empty string
      return { document: null };
    }
    return { document: data[path].document };
  };

  getQueryFragment = () => {
    return `
      ${this.path} {
        document
      }
    `;
  };
}
