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
  getValue = data => {
    const { many, path } = this.config;
    if (!data[path]) {
      return many ? [] : null;
    }
    return many ? data[path].map(i => i.id) : data[path].id;
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
