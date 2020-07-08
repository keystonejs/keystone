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
    return /\S+@\S+\.\S+/.test(email);
  }
}
