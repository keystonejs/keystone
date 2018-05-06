import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  getValue = data => {
    const { path } = this.config;
    return data[path] ? data[path] : null;
  };
  getInitialData = () => {
    return this.config.defaultValue || null;
  };
}
