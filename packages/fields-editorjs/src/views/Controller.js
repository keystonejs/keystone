import Controller from '@keystonejs/fields/Controller';

export default class EditorJsController extends Controller {
  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is_i' ? `${this.path}_i` : `${this.path}_${type}`;
    return { [key]: value };
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };

  serialize = data => {
    if (data[this.path]) {
      return JSON.stringify(data[this.path]);
    }
    return null;
  };
  deserialize = data => {
    try {
      return JSON.parse(data[this.path]);
    } catch (error) {
      return {};
    }
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
  ];
}
