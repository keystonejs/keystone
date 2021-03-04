import { Text } from '@keystone-next/fields-legacy';

export class WysiwygImplementation extends Text.implementation {
  constructor(path, { editorConfig }) {
    super(...arguments);
    this.editorConfig = editorConfig;
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      editorConfig: this.editorConfig,
    };
  }
}
