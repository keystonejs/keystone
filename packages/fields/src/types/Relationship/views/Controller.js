import FieldController from '../../../Controller';

export default class RelationshipController extends FieldController {
  getRefList() {
    const { getListByKey } = this.adminMeta;
    const { ref } = this.config;
    return getListByKey(ref);
  }
  getQueryFragment = (path = this.path) => {
    return `
      ${path} {
        id
        _label_
      }
    `;
  };
  getFilterGraphQL = ({ type, value }) => {
    if (type === 'contains') {
      return `${this.path}_some: {id: "${value}"}`;
    } else if (type === 'is') {
      return `${this.path}: {id: "${value}"}`;
    }
  };
  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };
  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };

  deserialize = data => {
    // this is probably not a great solution
    // ideally, we should have a set option in the mutation
    this.lastSavedState = this.config.many
      ? (data[this.path] || []).map(x => x.id)
      : data[this.path]
      ? data[this.path].id
      : null;
    return data[this.path];
  };

  serialize = data => {
    const { path } = this;
    const { many } = this.config;

    let value = data[path];

    if (many) {
      let ids = [];
      if (Array.isArray(value)) {
        ids = value.map(x => x.id);
      }
      return {
        connect: ids.map(id => ({ id })),
        disconnect: this.lastSavedState
          .filter(id => {
            return !ids.includes(id);
          })
          .map(id => ({ id })),
      };
    }

    if (!value) {
      return { disconnect: { id: this.lastSavedState } };
    }

    return { connect: { id: value.id } };
  };
  getDefaultValue = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };

  getFilterTypes = () => {
    const { many } = this.config;
    if (many) {
      return [
        {
          type: 'contains',
          label: 'Contains',
          getInitialValue: () => null,
        },
      ];
    } else {
      return [
        {
          type: 'is',
          label: 'Is',
          getInitialValue: () => null,
        },
      ];
    }
  };
}
