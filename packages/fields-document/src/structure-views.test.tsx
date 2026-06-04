import { controller } from './structure-views'
import { fields } from './DocumentEditor/component-blocks/api'

test('serializes null structure data using schema initial values', () => {
  const field = controller({
    fieldKey: 'content',
    label: 'Content',
    description: null,
    customViews: {
      schema: fields.object({
        array: fields.array(fields.text({ label: 'Array item' })),
        conditional: fields.conditional(fields.checkbox({ label: 'Enabled', defaultValue: false }), {
          false: fields.object({
            nested: fields.text({ label: 'Nested', defaultValue: 'default nested' }),
          }),
          true: fields.text({ label: 'True value', defaultValue: 'default true' }),
        }),
      }),
    },
  } as any)

  expect(field.serialize({ kind: 'update', value: null })).toEqual({
    content: {
      array: [],
      conditional: {
        false: {
          nested: 'default nested',
        },
      },
    },
  })
})
