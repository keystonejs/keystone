import FieldController from '../../../../Controller';

export default class PasswordController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    return `${this.path}_${type}: ${value ? 'true' : 'false'}`;
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
}
