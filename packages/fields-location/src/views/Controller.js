import FieldController from '@keystonejs/fields/Controller';

export default class LocationController extends FieldController {
  getQueryFragment = () => `
    ${this.path} {
       id
       googlePlaceID
       formattedAddress
       lat
       lng
    }
  `;
}
