// @flow
import FieldController from '../../../Controller';

type FilterGraphQL = {| type: string, value: string |};
type FilterLabel = {| label: string |};
type FormatFilter = {| label: string, value: string |};
type DataType = { [key: string]: string };

export default class TextController extends FieldController {
  getFilterGraphQL = ({ type, value }: FilterGraphQL): string => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return `${key}: ${value}`;
  };
  getFilterLabel = ({ label }: FilterLabel): string => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }: FormatFilter) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };
  serialize = (data: DataType): ?number => {
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
    // QUESTION: should we support "in" and "not_in" filters for Integer?
    // What does the UI look like for that.
  ];
}
