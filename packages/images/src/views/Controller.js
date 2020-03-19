import { FieldController } from '@keystonejs/fields/src/types/File/views/Controller';

export default class FileController extends FieldController {
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
