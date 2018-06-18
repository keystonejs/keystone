import FieldController from '../../Controller';

export default class PasswordController extends FieldController {
  getFilterGraphQL = (field, filter, value) => {
    return `${field.path}_${filter.type}: ${value}`;
  };
  getFilterLabel = (field, filter, value) => {
    return `${field.label} ${value ? 'is set' : 'is not set'}`;
  };
  filterTypes = [
    {
      type: 'is_set',
      label: 'Is Set',
      getInitialValue: () => true,
    },
  ];
}
