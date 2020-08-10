import FieldController from '@keystonejs/fields/Controller';

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
  serialize = data => {
    const { path } = this;
    if (!data || !data[path]) {
      // Forcibly return null if empty string
      return null;
    }
    return data[path];
  };
  getFilterTypes = () => [];
}
