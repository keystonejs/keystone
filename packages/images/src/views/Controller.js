import FieldController from '@keystonejs/fields/Controller';

export default class FileController extends FieldController {
  serialize = data => {
    const { path } = this;
    if (!data || !data[path]) {
      // Forcibly return null if empty string
      return null;
    }
    return data[path];
  };
  getQueryFragment = () => `
    ${this.path} {
       src
    }
  `;
  getFilterTypes = () => [];
}
