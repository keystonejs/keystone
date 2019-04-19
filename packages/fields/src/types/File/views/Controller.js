import FieldController from '../../../Controller';

export default class FileController extends FieldController {
  getValue = data => {
    const { path } = this.config;
    if (!data || !data[path]) {
      // Forcibly return null if empty string
      return null;
    }
    return data[path];
  };
  getQueryFragment = () => `
    ${this.path} {
       id
       path
       filename
       mimetype
       encoding
       publicUrl
    }
  `;
  getFilterTypes = () => [];
}
