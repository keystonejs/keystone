import FieldController from '../../../Controller';

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
