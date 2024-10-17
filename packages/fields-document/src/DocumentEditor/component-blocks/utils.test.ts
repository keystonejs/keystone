import { fields } from './api'
import { getAncestorSchemas, getSchemaAtPropPath } from './utils'

const blockChild = fields.child({ kind: 'block', placeholder: '' })
const blockChild2 = fields.child({ kind: 'block', placeholder: '' })
const inlineChild = fields.child({ kind: 'inline', placeholder: '' })
const inlineChild2 = fields.child({ kind: 'inline', placeholder: '' })

const props = {
  something: fields.object({
    blockChild,
  }),
  another: fields.conditional(fields.checkbox({ label: '', defaultValue: false }), {
    false: blockChild2,
    true: inlineChild,
  }),
  inlineChild2,
}

const falseVal = {
  something: {},
  another: {
    discriminant: false,
  },
}

const trueVal = {
  something: {},
  another: {
    discriminant: true,
  },
}

test('getChildFieldAtPath', () => {
  expect(getSchemaAtPropPath(['something', 'blockChild'], falseVal, props)).toBe(blockChild)
  expect(getSchemaAtPropPath(['another', 'value'], falseVal, props)).toBe(blockChild2)
  expect(getSchemaAtPropPath(['another', 'value'], trueVal, props)).toBe(inlineChild)
  expect(getSchemaAtPropPath(['inlineChild2'], falseVal, props)).toBe(inlineChild2)
})

test('getAncestorFields', () => {
  const root = { kind: 'object' as const, fields: props }
  expect(getAncestorSchemas(root, ['something', 'blockChild'], falseVal)).toEqual([
    root,
    props.something,
  ])
  expect(getAncestorSchemas(root, ['another', 'value'], falseVal)).toEqual([root, props.another])
  expect(getAncestorSchemas(root, ['another', 'value'], trueVal)).toEqual([root, props.another])
  expect(getAncestorSchemas(root, ['inlineChild2'], falseVal)).toEqual([root])
})
