import { Controller } from '@voussoir/admin-view';

export class CloudinaryImageController extends Controller {
  getQueryFragment = () => `
    ${this.path} {
       id
       path
       filename
       mimetype
       encoding
       publicUrlTransformed(transformation: { width: "120" crop: "limit" })
    }
  `;
}
