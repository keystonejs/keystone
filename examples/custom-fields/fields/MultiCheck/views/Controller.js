import FieldController from '@keystonejs/fields/Controller';
import { parseDefaultValues } from '../util';

class MultiCheckController extends FieldController {
  constructor(config, ...args) {
    const defaultValue = parseDefaultValues(config.defaultValue, config.options);
    super({ ...config, defaultValue }, ...args);
  }

  // Allow JSON values to be stored as String
  serialize = data => {
    return data[this.path] ? JSON.stringify(data[this.path]) : undefined;
  };

  // Allow string values to be returned as JSON
  deserialize = data => {
    return data[this.path] ? JSON.parse(data[this.path]) : null;
  };

  // For simplicity let's disable filtering on this field (PRs welcome)
  getFilterTypes = () => [];
}

export default MultiCheckController;
