import Controller from '@keystone-next/fields-legacy/Controller';

export default class FileController extends Controller {
  getQueryFragment = () => `
    ${this.path} {
      id
      unsplashId
      description
      publicUrlTransformed(transformation: { w: "120" })
      user {
        url
        name
      }
    }
  `;

  deserialize = data => {
    const image = data[this.path];
    if (!image || !image.unsplashId) {
      return '';
    }
    return image.unsplashId;
  };

  getFilterTypes = () => [];
}
