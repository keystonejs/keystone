import FieldController from '../../Controller';

export default class PasswordController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    return `${this.path}_${type}: ${value ? 'true' : 'false'}`;
  };
  getFilterLabel = ({ value }) => {
    return `${this.label}`;
  };
  formatFilter = () => {
    return `${this.label} ${value ? 'is set' : 'is not set'}`;
  };
  filterTypes = [
    {
      type: 'is_set',
      label: 'Is Set',
      getInitialValue: () => true,
    },
  ];
}
