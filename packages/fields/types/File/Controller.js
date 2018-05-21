import FieldController from '../../Controller';

export default class FileController extends FieldController {
  getValue = data => {
    const { path } = this.config;
    console.log('FileController::getValue', { data, path });
    if (!data || !data[path]) {
      console.log(`No ${path} set, returning null`);
      // Forcibly return null if empty string
      return null;
    }
    console.log(`Returning ${data[path]} for ${path}`);
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
  `
}
