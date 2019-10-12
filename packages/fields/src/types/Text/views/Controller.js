import FieldController from '../../../Controller';

export default class TextController extends FieldController {

  parseFilter = (key) => {
    let type = key;
    if (type.endsWith('_i')) {
      this.isFilterInsensitive = true;
      type = type.slice(0, -2);
    }
    return this.getFilterTypes().find(t => {
      return type === `${this.path}_${t.type}`;
    });
  }
  encodeFilter = (type, value) => {
    if (this.getFilterInsensitive()) {
      return [`${this.path}_${type}_i`, JSON.stringify(value)];
    }
    return [`${this.path}_${type}`, JSON.stringify(value)];
  }

  setFilterInsensitive = (isFilterInsensitive) => {
    this.isFilterInsensitive = isFilterInsensitive;
  }
  getFilterInsensitive = () => {
    return this.isFilterInsensitive;
  }
  getFilterGraphQL = ({ type, value }) => {
    let key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    if (this.getFilterInsensitive()) {
      key = `${key}_i`;
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
