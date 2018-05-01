import FieldController from '../../Controller';

export default class SelectController extends FieldController {
  getInitialData = () => {
    return this.config.defaultValue || null;
  };
}
