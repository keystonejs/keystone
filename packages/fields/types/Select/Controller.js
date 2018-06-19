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
  getFilterGraphQL = (field, filter, value) => {
    // return `${field.path}_${filter.type}: ${value}`;
  };
  getFilterLabel = ({ field, filter, value }) => {
    if (!value.options.length) {
      return value.inverted
        ? `${field.label} is set`
        : `${field.label} has no value`;
    }
    if (value.options.length > 1) {
      const values = value.options.map(i => i.label).join(', ');
      return value.inverted
        ? `${field.label} is not in [${values}]`
        : `${field.label} is in [${values}]`;
    }
    const optionLabel = value.options[0].label;
    return value.inverted
      ? `${field.label} is not ${optionLabel}`
      : `${field.label} is ${optionLabel}`;
  };
  filterTypes = [
    {
      type: 'is',
      label: 'Matches',
      getInitialValue: () => ({ inverted: false, options: [] }),
    },
  ];
}
