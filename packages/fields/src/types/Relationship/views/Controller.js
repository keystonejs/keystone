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

  // TODO: FIXME: This should be `set`, not `connect`
  buildRelateToOneInput = ({ id }) => ({ connect: { id } });
  buildRelateToManyInput = data => ({ connect: data.map(({ id }) => ({ id })) });

  getValue = data => {
    const { many, path } = this.config;

    if (!data[path]) {
      return many ? { disconnectAll: true } : null;
    }

    if (many) {
      if (!Array.isArray(data[path]) || !data[path].length) {
        return many ? { disconnectAll: true } : null;
      }
      return this.buildRelateToManyInput(data[path], path);
    }

    return this.buildRelateToOneInput(data[path], path);
  };
  getInitialData = () => {
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
