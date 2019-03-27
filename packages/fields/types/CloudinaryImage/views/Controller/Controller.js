/* eslint-disable import/no-extraneous-dependencies */

import FieldController from '../../../File/views/Controller/Controller';

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
