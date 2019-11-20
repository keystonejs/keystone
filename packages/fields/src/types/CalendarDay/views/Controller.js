import FieldController from '../../../Controller';
import { parseISO, isWithinInterval } from 'date-fns';

export default class CalendarDayController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return `${key}: "${value}"`;
  };

  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };

  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };

  serialize = data => {
    const value = data[this.path];
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

  validateInput = ({ resolvedData, addFieldValidationError }) => {
    const { dateInterval: { from, to } } = this.config;
    console.log(typeof from);
    const inRange = isWithinInterval(parseISO(resolvedData[this.path]), {
      start: parseISO(from),
      end: parseISO(to),
    });

    if (!inRange) {
      return addFieldValidationError(`CalendarDay input not within configured date interval.`);
    }
  };
}
