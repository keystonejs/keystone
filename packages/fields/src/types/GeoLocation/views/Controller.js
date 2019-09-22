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
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'object') {
      return value;
    } else {
      // If it is neither string nor number then it must be empty.
      return {};
    }
  };
  deserialize = data => data[this.path];
  validateInput = ({ addFieldValidationError, originalInput }) => {
    const rangeCheck = (input, min, max) => input >= min && input <= max;
    if (!originalInput.location.lng) {
      addFieldValidationError('Longitude not found');
    } else if (!rangeCheck(originalInput.location.lng, 0, 180)) {
      addFieldValidationError('Longitude should be in range 0 ~ 180');
    }
    if (!originalInput.location.lat) {
      addFieldValidationError('Latitude not found');
    } else if (!rangeCheck(originalInput.location.lat, 0, 90)) {
      addFieldValidationError('Latitude should be in range 0 ~ 90');
    }
  };
  getFilterTypes = () => [];
  getQueryFragment = () => `
    ${this.path} {
       lng
       lat
    }
  `;
}
