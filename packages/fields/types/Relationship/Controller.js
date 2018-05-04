import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  getInitialData = () => {
    const { defaultValue, many } = this.config;
    return many ? defaultValue || [] : defaultValue || null;
  };
}
