import { Text } from '../Text/Implementation';

export class Email extends Text {
  validateInput({ resolvedData, addFieldValidationError }) {
    const fieldValue = resolvedData[this.path];

    if (!this.isRequired && !fieldValue) {
      // If the field isn't required and we don't have a value we can skip any validation checks
      return;
    }

    if (!this.isValidEmail(fieldValue)) {
      addFieldValidationError(`Invalid email`, { value: fieldValue });
    }
  }

  isValidEmail(email) {
    // https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html#input.email.attrs.value.single
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  }
}
