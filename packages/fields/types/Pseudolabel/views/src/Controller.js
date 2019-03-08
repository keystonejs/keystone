import FieldController from '../../../../Controller';

export default class PseudolabelController extends FieldController {
  getFilterGraphQL = () => undefined;
  getFilterLabel = () => undefined;
  formatFilter = () => undefined;
  getFilterTypes = () => undefined;
  isSortable = () => false;
  isEditable = () => false;
}
