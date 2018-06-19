import FieldController from '../../Controller';

export default class TextController extends FieldController {
  getFilterGraphQL = (field, filter, value) => {
    const key =
      filter.type === 'is' ? `${field.path}` : `${field.path}_${filter.type}`;
    return `${key}: "${value}"`;
  };
  getFilterLabel = ({ field, label, value }, withValue) => {
    console.log('getFilterLabel', { field, label, value });
    const maybeValue = withValue ? `: "${value}"` : '';
    const filterLabel = label.toLowerCase();

    return `${field.label} ${filterLabel}` + maybeValue;
  };
  filterTypes = [
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
