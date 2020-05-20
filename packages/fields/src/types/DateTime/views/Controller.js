import { format, parseISO } from 'date-fns';
import FieldController from '../../../Controller';

export default class DateTimeController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return { [key]: value };
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    const formatConfig = this.config.format;
    let formattedValue = value;

    if (formatConfig) {
      formattedValue = format(parseISO(value), formatConfig);
    }

    return `${this.getFilterLabel({ label })}: "${formattedValue}"`;
  };
  serialize = data => {
    let value = data[this.path];
    if (typeof value !== 'string') {
      return null;
    }
    return value.trim() || null;
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
      label: 'Is after',
      getInitialValue: () => '',
    },
    {
      type: 'lt',
      label: 'Is before',
      getInitialValue: () => '',
    },
    {
      type: 'gte',
      label: 'Is after or equal to',
      getInitialValue: () => '',
    },
    {
      type: 'lte',
      label: 'Is before or equal to',
      getInitialValue: () => '',
    },
    // QUESTION: should we support "in" and "not_in" filters for DateTime?
    // What does the UI look like for that.
  ];
}
