import { Controller } from '@voussoir/admin-view';

export class FileController extends Controller {
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
