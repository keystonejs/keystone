import { Text } from '@keystonejs/fields';

export class WysiwygImplementation extends Text.implementation {
  constructor(path, { apiKey, editorConfig }) {
    super(...arguments);
    this.apiKey = apiKey;
    this.editorConfig = editorConfig;
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      apiKey: this.apiKey,
      editorConfig: this.editorConfig,
    };
  }
}
