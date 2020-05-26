import FieldController from '../../../Controller';

export default class CheckboxController extends FieldController {
  constructor({ defaultValue = false, ...config }, ...args) {
    super({ ...config, defaultValue }, ...args);
  }
  serialize = data => data[this.path];
  deserialize = data => data[this.path];
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return { [key]: value };
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: ${value}`;
  };
  getFilterTypes = () => [
    {
      type: 'is',
      label: 'Is',
      getInitialValue: () => true,
    },
    {
      type: 'not',
      label: 'Is not',
      getInitialValue: () => true,
    },
  ];
}
