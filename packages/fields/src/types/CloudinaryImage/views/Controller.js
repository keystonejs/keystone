import FieldController from '../../File/views/Controller';

export default class CloudinaryImageController extends FieldController {
  getQueryFragment = () => `
    ${this.path} {
      id
      path
      filename
      originalFilename
      mimetype
      encoding
      publicUrlTransformed(transformation: { width: "120" crop: "limit" })
    }
  `;
}
