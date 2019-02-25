import { Controller } from '@voussoir/admin-view';

export class PasswordController extends Controller {
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
