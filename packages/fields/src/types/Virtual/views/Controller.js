import FieldController from '../../../Controller';
export default class VirtualController extends FieldController {
  getQueryFragment = () => {
    return `${this.path}${this.config.graphQLSelection}`;
  };

  getFilterTypes = () => [];
}
