import FieldController from '../../../Controller';

export default class UuidController extends FieldController {
  getFilterGraphQL = ({ type, value }) => {
    switch (type) {
      case 'is': {
        return { [this.path]: value };
      }
      case 'not': {
        return { [`${this.path}_not`]: value };
      }
      case 'in': {
        return { [`${this.path}_in`]: value.split(',').map(value => value.trim()) };
      }
      case 'not_in': {
        return { [`${this.path}_not_in`]: value.split(',').map(value => value.trim()) };
      }
    }
  };
  getFilterLabel = ({ label, type }) => {
    let suffix = '';
    if (['in', 'not_in'].includes(type)) {
      suffix = ' (comma separated)';
    }
    return `${this.label} ${label.toLowerCase()}${suffix}`;
  };

  formatFilter = ({ label, type, value }) => {
    let renderedValue = value;
    if (['in', 'not_in'].includes(type)) {
      renderedValue = value
        .split(',')
        .map(value => value.trim())
        .join(', ');
    }
    return `${this.label} ${label.toLowerCase()}: ${renderedValue}`;
  };

  getFilterTypes = () => [
    {
      type: 'is',
      label: 'Is exactly',
      getInitialValue: () => '',
    },
    {
      type: 'not',
      label: 'Is not',
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
