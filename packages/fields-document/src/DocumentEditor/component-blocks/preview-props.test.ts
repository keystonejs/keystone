import { assert } from '../utils';
import { fields } from './api';
import { getInitialPropsValue } from './initial-values';
import { createGetPreviewProps } from './preview-props';

test('onChange on a conditional field updates props.value', () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.text({ label: '' }),
    false: fields.array(fields.checkbox({ label: '' })),
  });
  let val = getInitialPropsValue(field);
  const getPreviewProps = createGetPreviewProps(field, newVal => {
    val = newVal(val);
    props = getPreviewProps(val);
  });
  let props = getPreviewProps(val);
  assert(props.discriminant === false);
  expect(props.value.field).toBe(field.values.false);
  props.onChange(true);
  expect(props.discriminant).toBe(true);
  expect(props.value.field).toBe(field.values.true);
});

// note props.value is the preview props for the value of the conditional field, not the value itself
test("onChange on a conditional field updates props.value where the value doesn't change", () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.text({ label: 'true' }),
    false: fields.text({ label: 'false' }),
  });
  let val = getInitialPropsValue(field);
  const getPreviewProps = createGetPreviewProps(field, newVal => {
    val = newVal(val);
    props = getPreviewProps(val);
  });
  let props = getPreviewProps(val);
  assert(props.discriminant === false);
  expect(props.value.field).toBe(field.values.false);
  props.onChange(true);
  expect(props.discriminant).toBe(true);
  expect(props.value.field).toBe(field.values.true);
});

test("array fields don't keep the props of an array item around after removing the item", () => {
  const field = fields.array(fields.text({ label: '' }));
  let val = getInitialPropsValue(field);
  const getPreviewProps = createGetPreviewProps(field, newVal => {
    val = newVal(val);
    props = getPreviewProps(val);
  });
  let props = getPreviewProps(val);
  props.onChange([
    { id: '1', value: 'blah' },
    { id: '2', value: 'blah2' },
  ]);

  let elementsBeforeChange = props.elements;
  props.onChange([{ id: '2' }]);
  expect(props.elements[0].element).toBe(elementsBeforeChange[1].element);
  expect(props.elements[0]).toBe(elementsBeforeChange[1]);
  props.onChange([{ id: '2' }, { id: '1', value: 'blah' }]);
  expect(props.elements[1].element).not.toBe(elementsBeforeChange[0].element);
  expect(props.elements[1]).not.toBe(elementsBeforeChange[0]);
});

test('the props of two array fields in a conditional field change when the discriminant changes', () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.array(fields.array(fields.text({ label: '' }))),
    false: fields.array(fields.checkbox({ label: '' })),
  });
  let val = getInitialPropsValue(field);
  const getPreviewProps = createGetPreviewProps(field, newVal => {
    val = newVal(val);
    props = getPreviewProps(val);
  });
  let props = getPreviewProps(val);
  assert(props.discriminant === false);
  let prevOnInsert = props.value.onInsert;
  props.onChange(true);
  props = getPreviewProps(val);
  assert(props.discriminant === true);
  expect(prevOnInsert).not.toBe(props.value.onInsert);
  props.value.onInsert([{ id: undefined, value: 'blah' }]);
  expect(props.value.elements).toHaveLength(1);
  expect(props.value.elements[0].element.elements).toHaveLength(1);
  expect(props.value.elements[0].element.elements[0].element.value).toEqual('blah');
});
