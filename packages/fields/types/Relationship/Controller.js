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

  // TODO: FIXME: This should be `set`, not `connect`
  buildRelateToOneInput = ({ id }) => ({ connect: { id } });
  buildRelateToManyInput = data => ({ connect: data.map(({ id }) => ({ id })) });

  getValue = data => {
    const { many, path } = this.config;

    if (!data[path]) {
      return null;
    }

    if (many) {
      if (!Array.isArray(data[path]) || !data[path].length) {
        return null;
      }
      return this.buildRelateToManyInput(data[path], path);
    }

    return this.buildRelateToOneInput(data[path], path);
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
  getFilterTypes = () => [];
}
