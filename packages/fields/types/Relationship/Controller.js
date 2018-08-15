import FieldController from '../../Controller';

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

  dataToRelationshipInput = (data, pathKey) => {
    if (data.id && data.create) {
      throw new Error(
        `Cannot provide both an id and create data when linking ${this.list.key}.${pathKey} to a ${
          this.config.ref
        }`
      );
    }

    if (data.id) {
      return { id: data.id };
    }

    return { create: data };
  };

  getValue = data => {
    const { many, path } = this.config;
    if (!data[path]) {
      return many ? [] : null;
    }
    return many
      ? data[path].map(value => this.dataToRelationshipInput(value, path))
      : this.dataToRelationshipInput(data[path], path);
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
