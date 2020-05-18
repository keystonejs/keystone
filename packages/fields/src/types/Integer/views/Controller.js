import FieldController from '../../../Controller';

export default class IntegerController extends FieldController {
  getFilterGraphQL = ({ path, type, value }) => {
    const key = type === 'is' ? path : `${path}_${type}`;
    let arg = value.replace(/\s/g, '');
    if (['in', 'not_in'].includes(type)) {
      arg = arg.split(',').map(i => parseInt(i));
    } else {
      arg = parseInt(arg);
    }
    return { [key]: arg };
  };
  getFilterLabel = ({ label, type }) => {
    const suffix = ['in', 'not_in'].includes(type) ? ' (comma separated)' : '';
    return `${this.label} ${label.toLowerCase()}${suffix}`;
  };
  formatFilter = ({ label, type, value }) => {
    return `${this.getFilterLabel({ label, type })}: "${value.replace(/\s/g, '')}"`;
  };
  serialize = data => {
    const value = data[this.path];
    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string' && value.length > 0) {
      // The field component enforces numeric values
      return parseInt(value, 10);
    } else {
      // if it is not a String or a Number then the field must be empty
      return null;
    }
  };
  getFilterTypes = () => [
    {
      type: 'is',
      label: 'Is exactly',
      getInitialValue: () => '',
    },
    {
      type: 'not',
      label: 'Is not exactly',
      getInitialValue: () => '',
    },
    {
      type: 'gt',
      label: 'Is greater than',
      getInitialValue: () => '',
    },
    {
      type: 'lt',
      label: 'Is less than',
      getInitialValue: () => '',
    },
    {
      type: 'gte',
      label: 'Is greater than or equal to',
      getInitialValue: () => '',
    },
    {
      type: 'lte',
      label: 'Is less than or equal to',
      getInitialValue: () => '',
    },
    {
      type: 'in',
      label: 'Is one of',
      getInitialValue: () => '',
    },
    {
      type: 'not_in',
      label: 'Is not one of',
      getInitialValue: () => '',
    },
  ];
}
