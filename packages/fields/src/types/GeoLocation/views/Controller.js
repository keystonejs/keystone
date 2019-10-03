import FieldController from '../../../Controller';

export default class TextController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return `${key}: "${value}"`;
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };
  serialize = data => {
    const value = data[this.path];
    if (typeof value === 'object') {
      return { type: 'Point', coordinates: [value.lng, value.lat] };
    } else {
      return {};
    }
  };
  deserialize = data => {
    if(data[this.path]){
      return {
        lng: data[this.path].coordinates[0],
        lat: data[this.path].coordinates[1],
      };
    }
    return {};
  };
  validateInput = ({ addFieldValidationError, originalInput }) => {
    const rangeCheck = (input, min, max) => input >= min && input <= max;
    if (!originalInput.location.coordinates) return false;
    const [lng, lat] = originalInput.location.coordinates;
    if (!lng) {
      addFieldValidationError('Longitude not found');
    } else if (lng == NaN) {
      addFieldValidationError('Longitude must be a number');
    } else if (!rangeCheck(lng, -180, 180)) {
      addFieldValidationError('Longitude should be in range -180 ~ 180');
    }
    if (!lat) {
      addFieldValidationError('Latitude not found');
    } else if (lat == NaN) {
      addFieldValidationError('Latitude must be a number');
    } else if (!rangeCheck(lat, -90, 90)) {
      addFieldValidationError('Latitude should be in range -90 ~ 90');
    }
  };
  getFilterTypes = () => [];
  getQueryFragment = () => `
    ${this.path} {
       coordinates
    }
  `;
}
