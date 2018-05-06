import FieldController from '../../Controller';

export default class RelationshipController extends FieldController {
  getRefList() {
    const { getListByKey } = this.adminMeta;
    const { ref } = this.config;
    return getListByKey(ref);
  }
  getValue = data => {
    const { many, path } = this.config;
    return data[path] ? data[path] : many ? [] : null;
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
