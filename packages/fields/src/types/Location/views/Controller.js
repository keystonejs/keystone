import FieldController from '../../../Controller';

export default class LocationController extends FieldController {
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
       id
       googlePlaceId
       formattedAddress
       lat
       lng
    }
  `;
  getFilterTypes = () => [];
}
