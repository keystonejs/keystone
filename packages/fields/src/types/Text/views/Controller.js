import FieldController from '../../../Controller';

export default class TextController extends FieldController {
  parseFilter = key => {
    let type = key;
    if (!type.endsWith('_i')) {
      this.setFilterSensitive(true);
      type = `${type}_i`;
    }
    return this.getFilterTypes().find(t => {
      return type === `${this.path}_${t.type}`;
    });
  };
  encodeFilter = (type, value) => {
    if (this.getFilterSensitive()) {
      return [`${this.path}_${type.slice(0, -2)}`, JSON.stringify(value)];
    }
    return [`${this.path}_${type}`, JSON.stringify(value)];
  };
  setFilterSensitive = isFilterSensitive => {
    this.isFilterSensitive = isFilterSensitive;
  };
  getFilterSensitive = () => {
    return this.isFilterSensitive === undefined ? false : this.isFilterSensitive;
  };
  getFilterGraphQL = ({ type, value }) => {
    let key = type === 'is_i' ? `${this.path}_i` : `${this.path}_${type}`;
    if (this.getFilterSensitive()) {
      key = `${key.slice(0, -2)}`;
    }
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
      type: 'contains_i',
      label: 'Contains',
      getInitialValue: () => '',
    },
    {
      type: 'not_contains_i',
      label: 'Does not contain',
      getInitialValue: () => '',
    },
    {
      type: 'is_i',
      label: 'Is exactly',
      getInitialValue: () => '',
    },
    {
      type: 'not_i',
      label: 'Is not exactly',
      getInitialValue: () => '',
    },
    {
      type: 'starts_with_i',
      label: 'Starts with',
      getInitialValue: () => '',
    },
    {
      type: 'not_starts_with_i',
      label: 'Does not start with',
      getInitialValue: () => '',
    },
    {
      type: 'ends_with_i',
      label: 'Ends with',
      getInitialValue: () => '',
    },
    {
      type: 'not_ends_with_i',
      label: 'Does not end with',
      getInitialValue: () => '',
    },
  ];
}
