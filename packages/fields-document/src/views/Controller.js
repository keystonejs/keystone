import TextController from '../core/TextController';

const DEFAULT_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default class DocumentController extends TextController {
  serialize = data => {
    console.log('serialising value', data);
    return Array.isArray(data[this.path]) ? JSON.stringify(data[this.path]) : null;
  };
  deserialize = data => {
    if (!data || !data[this.path]) return DEFAULT_VALUE;
    try {
      const value = JSON.parse(data[this.path]);
      if (Array.isArray(value)) return value;
    } catch (e) {}
    return DEFAULT_VALUE;
  };

  // NOTE: default value of `undefined` when passed to `Slate` Editable component can cause a render issue.
  getDefaultValue = ({ originalInput = {}, prefill = {} } = {}) => {
    return this._getDefaultValue({ originalInput, prefill }) || DEFAULT_VALUE;
  };
}
