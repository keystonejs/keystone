import { type ArrayField, type ConditionalField, fields, type FormField, type ObjectField } from './api'
import { assertValidComponentSchema } from './field-assertions'

type EasilyCircularObject = ObjectField<{
  x: EasilyCircularObject
}>
const easilyCircularObject: EasilyCircularObject = fields.object({
  get x () {
    return easilyCircularObject
  },
})

const discriminant = fields.checkbox({ label: '' })

test('does not allow circular object', () => {
  expect(() => {
    assertValidComponentSchema(easilyCircularObject, new Set())
  }).toThrowErrorMatchingInlineSnapshot(
    `"The field "object.x" is the same as it's ancestor. Use an array or conditional field for recursive structures."`
  )
})

test('does not allow a circular object within an array', () => {
  expect(() => {
    assertValidComponentSchema(fields.array(easilyCircularObject), new Set())
  }).toThrowErrorMatchingInlineSnapshot(
    `"The field "array.object.x" is the same as it's ancestor. Use an array or conditional field for recursive structures."`
  )
})

test('does not allow a circular object within a value for a default discriminant of a conditional field', () => {
  expect(() => {
    assertValidComponentSchema(
      fields.conditional(discriminant, {
        true: fields.empty(),
        false: easilyCircularObject,
      }),

      new Set()
    )
  }).toThrowErrorMatchingInlineSnapshot(
    `"The field "conditional.false.object.x" is the same as it's ancestor. Use an array or conditional field for recursive structures."`
  )
})

test('does not allow a circular object within a value for a non-default discriminant of a conditional field', () => {
  expect(() => {
    assertValidComponentSchema(
      fields.conditional(discriminant, {
        true: easilyCircularObject,
        false: fields.empty(),
      }),

      new Set()
    )
  }).toThrowErrorMatchingInlineSnapshot(
    `"The field "conditional.true.object.x" is the same as it's ancestor. Use an array or conditional field for recursive structures."`
  )
})

test("does allow a circular conditional as long as it's not the default", () => {
  type Field = ConditionalField<
    typeof discriminant,
    { true: Field, false: FormField<null, undefined> }
  >
  const conditional: Field = fields.conditional(discriminant, {
    get true () {
      return conditional
    },
    false: fields.empty(),
  })
  assertValidComponentSchema(conditional, new Set())
})

test("does not allow a circular conditional if it's the default", () => {
  type Field = ConditionalField<
    typeof discriminant,
    { false: Field, true: FormField<null, undefined> }
  >
  const conditional: Field = fields.conditional(discriminant, {
    get false () {
      return conditional
    },
    true: fields.empty(),
  })
  expect(() => {
    assertValidComponentSchema(conditional, new Set())
  }).toThrowErrorMatchingInlineSnapshot(
    `"The field "conditional.false" is the same as it's ancestor. Use an array or conditional field for recursive structures."`
  )
})

test("allows circularity if it's stopped by an array field", () => {
  type Field = ArrayField<
    ObjectField<{
      blah: Field
    }>
  >
  const blah: Field = fields.array(
    fields.object({
      get blah () {
        return blah
      },
    })
  )
  assertValidComponentSchema(blah, new Set())
})

test('does not allow a field that returns a different field from a getter each time', () => {
  type Field = ArrayField<
    ObjectField<{
      blah: Field
    }>
  >
  const blah: () => Field = () =>
    fields.array(
      fields.object({
        get blah () {
          return blah()
        },
      })
    )
  expect(() => {
    assertValidComponentSchema(blah(), new Set())
  }).toThrowErrorMatchingInlineSnapshot(
    `"Fields on an object field must not change over time but the field at "array.object.blah" changes between accesses"`
  )
})

// this is just a test to say "this is explicitly unhandled"
// if you do this, you know you're doing Bad Things
test('exceeds the call stack size for an infinitely recursive field where all fields are different', () => {
  type Field = ArrayField<
    ObjectField<{
      blah: Field
    }>
  >
  const blah: () => Field = () => {
    let a: Field
    return fields.array(
      fields.object({
        get blah () {
          if (!a) {
            a = blah()
          }
          return a
        },
      })
    )
  }
  expect(() => {
    assertValidComponentSchema(blah(), new Set())
  }).toThrowErrorMatchingInlineSnapshot(`"Maximum call stack size exceeded"`)
})

test('relationship field where no list exists with that name', () => {
  expect(() => {
    assertValidComponentSchema(
      fields.object({ a: fields.relationship({ listKey: 'Blah', label: 'Something' }) }),
      new Set()
    )
  }).toThrowErrorMatchingInlineSnapshot(
    `"The relationship field at "object.a" has the listKey "Blah" but no list named "Blah" exists."`
  )
})

test('relationship field where a list exists with that name', () => {
  assertValidComponentSchema(
    fields.object({ a: fields.relationship({ listKey: 'Blah', label: 'Something' }) }),
    new Set(['Blah'])
  )
})
