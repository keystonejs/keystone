import FieldController from '../../Controller';

export default class RelationshipController extends FieldController {
  getRefList() {
    const { getListByKey } = this.adminMeta;
    const { ref } = this.config;
    return getListByKey(ref);
  }
  getQueryFragment = (path = this.path) => {
    const refList = this.getRefList();
    const queryFields = refList.displayFields.filter(displayField => displayField !== 'id');
    return `${path} { id ${queryFields.join(' ')} }`;
  }
  getValue = data => {
    const { many, path } = this.config;
    return data[path] ? data[path].id : many ? [] : null;
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
