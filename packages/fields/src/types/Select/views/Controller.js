import FieldController from '../../../Controller';

export default class SelectController extends FieldController {
  constructor(config, ...args) {
    const defaultValue = 'defaultValue' in config ? config.defaultValue : null;
    super({ ...config, defaultValue }, ...args);
    this.options = config.options;
    this.dataType = config.dataType;
  }
  getFilterGraphQL = ({ value: { inverted, options } }) => {
    if (!options.length) {
      return '';
    }

    const isMulti = options.length > 1;

    let key = this.path;
    if (isMulti && inverted) {
      key = `${this.path}_not_in`;
    } else if (isMulti) {
      key = `${this.path}_in`;
    } else if (inverted) {
      key = `${this.path}_not`;
    }

    const value = isMulti ? `[${options.map(x => x.value).join(',')}]` : options[0].value;

    return this.dataType === 'string' ? `${key}: "${value}"` : `${key}: ${value}`;
  };
  getFilterLabel = (/*{ value }*/) => {
    return this.label;
  };
  formatFilter = ({ value }) => {
    if (!value.options.length) {
      return value.inverted ? `${this.label} is set` : `${this.label} has no value`;
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
  getFilterValue = value => {
    return value && value.options && value.options.length ? value : null;
  };
  getFilterTypes = () => [
    {
      type: 'is',
      label: 'Matches',
      getInitialValue: () => ({ inverted: false, options: [] }),
    },
  ];
}
