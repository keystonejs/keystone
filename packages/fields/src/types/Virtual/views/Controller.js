import FieldController from '../../../Controller';
export default class VirtualController extends FieldController {
  getQueryFragment = () => {
    return `${this.path}${this.config.graphQLSelection}`;
  };

  getFilterGraphQL = ({ type, value }) => {
    const key = type === 'is' ? `${this.path}` : `${this.path}_${type}`;
    return `${key}: "${value}"`;
  };

  getFilterLabel = ({ label }) => {
    return `${this.label} ${label.toLowerCase()}`;
  };

  formatFilter = ({ label, value }) => {
    return `${this.getFilterLabel({ label })}: "${value}"`;
  };

  getFilterTypes = () => [];
}
