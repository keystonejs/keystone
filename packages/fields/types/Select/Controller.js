import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  constructor(...args) {
    super(...args);
    this.options = this.config.options;
  }
  getValue = data => {
    const { path } = this.config;
    return data[path] ? data[path] : null;
  };
  getInitialData = () => {
    return this.config.defaultValue || null;
  };
  getFilterGraphQL = ({ type, value }) => {
    console.log('getFilterGraphQL', this, type, value);
  };
  getFilterLabel = (/*{ value }*/) => {
    return this.label;
  };
  formatFilter = ({ value }) => {
    if (!value.options.length) {
      return value.inverted
        ? `${this.label} is set`
        : `${this.label} has no value`;
    }
    if (value.options.length > 1) {
      const values = value.options.map(i => i.label).join(', ');
      return value.inverted
        ? `${this.label} is not in [${values}]`
        : `${this.label} is in [${values}]`;
    }
    const optionLabel = value.options[0].label;
    return value.inverted
      ? `${this.label} is not ${optionLabel}`
      : `${this.label} is ${optionLabel}`;
  };
  filterTypes = [
    {
      type: 'is',
      label: 'Matches',
      getInitialValue: () => ({ inverted: false, options: [] }),
    },
  ];
}
