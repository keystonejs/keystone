import FieldController from '../../../Controller';

export default class PasswordController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    return { [`${this.path}_${type}`]: value };
  };
  getFilterLabel = () => {
    return `${this.label}`;
  };
  formatFilter = ({ value }) => {
    return `${this.label} ${value ? 'is set' : 'is not set'}`;
  };

  // Passwords don't expose their own value like most fields
  getQueryFragment = () => `${this.path}_is_set`;

  getFilterTypes = () => [
    {
      type: 'is_set',
      label: 'Is Set',
      getInitialValue: () => true,
    },
  ];

  serialize = data => {
    // discard the "confirm" since we only need one version of the password
    return data[this.path] ? data[this.path].inputPassword : undefined;
  };

  validateInput = ({ originalInput, addFieldValidationError }) => {
    const { minLength } = this.config;

    if (this.isRequired) {
      if (!originalInput[this.path] || !originalInput[this.path].inputPassword) {
        return addFieldValidationError(`Password is required`);
      }
    } else if (!originalInput[this.path] || !originalInput[this.path].inputPassword) {
      //no password required and no password is set so just return
      return;
    }

    if (originalInput[this.path].inputPassword.length < minLength) {
      return addFieldValidationError(`Password must be at least ${minLength} characters`);
    }

    if (originalInput[this.path].inputPassword !== originalInput[this.path].inputConfirm) {
      return addFieldValidationError('Passwords do not match');
    }
  };
}
