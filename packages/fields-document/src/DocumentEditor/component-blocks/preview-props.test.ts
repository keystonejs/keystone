import { assert } from '../utils'
import { fields } from './api'
import { getInitialPropsValue } from './initial-values'
import { createGetPreviewProps } from './preview-props'

test('onChange on a conditional field updates props.value', () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.text({ label: '' }),
    false: fields.array(fields.checkbox({ label: '' })),
  })
  let val = getInitialPropsValue(field)
  const getPreviewProps = createGetPreviewProps(
    field,
    newVal => {
      val = newVal(val)
      props = getPreviewProps(val)
    },
    () => undefined
  )
  let props = getPreviewProps(val)
  assert(props.discriminant === false)
  expect(props.value.schema).toBe(field.values.false)
  props.onChange(true)
  expect(props.discriminant).toBe(true)
  expect(props.value.schema).toBe(field.values.true)
})

// note props.value is the preview props for the value of the conditional field, not the value itself
test("onChange on a conditional field updates props.value where the value doesn't change", () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.text({ label: 'true' }),
    false: fields.text({ label: 'false' }),
  })
  let val = getInitialPropsValue(field)
  const getPreviewProps = createGetPreviewProps(
    field,
    newVal => {
      val = newVal(val)
      props = getPreviewProps(val)
    },
    () => undefined
  )
  let props = getPreviewProps(val)
  assert(props.discriminant === false)
  expect(props.value.schema).toBe(field.values.false)
  props.onChange(true)
  expect(props.discriminant).toBe(true)
  expect(props.value.schema).toBe(field.values.true)
})

test("array fields don't keep the props of an array item around after removing the item", () => {
  const field = fields.array(fields.text({ label: '' }))
  let val = getInitialPropsValue(field)
  const getPreviewProps = createGetPreviewProps(
    field,
    newVal => {
      val = newVal(val)
      props = getPreviewProps(val)
    },
    () => undefined
  )
  let props = getPreviewProps(val)
  props.onChange([
    { key: '1', value: 'blah' },
    { key: '2', value: 'blah2' },
  ])

  const elementsBeforeChange = props.elements
  props.onChange([{ key: '2' }])
  expect(props.elements[0]).toBe(elementsBeforeChange[1])
  expect(props.elements[0]).toBe(elementsBeforeChange[1])
  props.onChange([{ key: '2' }, { key: '1', value: 'blah' }])
  expect(props.elements[1]).not.toBe(elementsBeforeChange[0])
  expect(props.elements[1]).not.toBe(elementsBeforeChange[0])
})

test('the props of two array fields in a conditional field change when the discriminant changes', () => {
  const field = fields.conditional(fields.checkbox({ label: '' }), {
    true: fields.array(fields.array(fields.text({ label: '' }))),
    false: fields.array(fields.checkbox({ label: '' })),
  })
  let val = getInitialPropsValue(field)
  const getPreviewProps = createGetPreviewProps(
    field,
    newVal => {
      val = newVal(val)
      props = getPreviewProps(val)
    },
    () => undefined
  )
  let props = getPreviewProps(val)
  assert(props.discriminant === false)
  const prevArrayOnChange = props.value.onChange
  props.onChange(true)
  props = getPreviewProps(val)
  assert(props.discriminant === true)
  expect(prevArrayOnChange).not.toBe(props.value.onChange)
  props.value.onChange([{ key: undefined, value: [{ key: undefined, value: 'blah' }] }])
  expect(props.value.elements).toHaveLength(1)
  expect(props.value.elements[0].elements).toHaveLength(1)
  expect(props.value.elements[0].elements[0].value).toEqual('blah')
})
