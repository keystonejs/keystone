import { fields } from './api';
import { getChildFieldAtPropPath } from './utils';

const blockChild = fields.child({ kind: 'block', placeholder: '' });
const blockChild2 = fields.child({ kind: 'block', placeholder: '' });
const inlineChild = fields.child({ kind: 'inline', placeholder: '' });
const inlineChild2 = fields.child({ kind: 'inline', placeholder: '' });

const props = {
  something: fields.object({
    blockChild,
  }),
  another: fields.conditional(fields.checkbox({ label: '', defaultValue: false }), {
    false: blockChild2,
    true: inlineChild,
  }),
  inlineChild2,
};

const falseVal = {
  another: {
    discriminant: false,
  },
};

const trueVal = {
  another: {
    discriminant: true,
  },
};

test('getChildFieldAtPath', () => {
  expect(getChildFieldAtPropPath(['something', 'blockChild'], falseVal, props)).toBe(blockChild);
  expect(getChildFieldAtPropPath(['another', 'value'], falseVal, props)).toBe(blockChild2);
  expect(getChildFieldAtPropPath(['another', 'value'], trueVal, props)).toBe(inlineChild);
  expect(getChildFieldAtPropPath(['inlineChild2'], falseVal, props)).toBe(inlineChild2);
});
