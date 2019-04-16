import FieldController from '../../../Controller';

export default class TextController extends FieldController {
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
  getFilterTypes = () => [
    {
      type: 'contains',
      label: 'Contains',
      getInitialValue: () => '',
    },
    {
      type: 'not_contains',
      label: 'Does not contain',
      getInitialValue: () => '',
    },
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
      type: 'starts_with',
      label: 'Starts with',
      getInitialValue: () => '',
    },
    {
      type: 'not_starts_with',
      label: 'Does not start with',
      getInitialValue: () => '',
    },
    {
      type: 'ends_with',
      label: 'Ends with',
      getInitialValue: () => '',
    },
    {
      type: 'not_ends_with',
      label: 'Does not end with',
      getInitialValue: () => '',
    },
  ];
}
