import FieldController from '@keystone-next/fields-legacy/Controller';

export default class LocationGoogleController extends FieldController {
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
