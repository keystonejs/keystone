import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  getValue = data => {
    const { many, path } = this.config;
    return data[path] ? data[path] : many ? [] : null;
  };
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
