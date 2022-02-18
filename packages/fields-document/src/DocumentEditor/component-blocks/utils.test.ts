import { fields } from './api';
import { getAncestorFields, getChildFieldAtPropPath } from './utils';

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
  something: {},
  another: {
    discriminant: false,
  },
};

const trueVal = {
  something: {},
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

test('getAncestorFields', () => {
  let root = { kind: 'object' as const, value: props };
  expect(getAncestorFields(root, ['something', 'blockChild'], falseVal)).toEqual([
    root,
    props.something,
  ]);
  expect(getAncestorFields(root, ['another', 'value'], falseVal)).toEqual([root, props.another]);
  expect(getAncestorFields(root, ['another', 'value'], trueVal)).toEqual([root, props.another]);
  expect(getAncestorFields(root, ['inlineChild2'], falseVal)).toEqual([root]);
});
