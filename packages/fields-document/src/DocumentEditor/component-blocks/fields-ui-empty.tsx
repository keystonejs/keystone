import type * as ui from './fields-ui.tsx'

function throwAlways(..._args: any[]): never {
  throw new Error(
    'React components from @keystone-6/fields-document/component-blocks cannot be rendered on the server'
  )
}

export const TextField = throwAlways as unknown as typeof ui.TextField,
  TextArea = throwAlways as unknown as typeof ui.TextArea,
  Checkbox = throwAlways as unknown as typeof ui.Checkbox,
  Text = throwAlways as unknown as typeof ui.Text,
  makeIntegerFieldInput = (() => throwAlways) as unknown as typeof ui.makeIntegerFieldInput,
  makeSelectFieldInput = (() => throwAlways) as unknown as typeof ui.makeSelectFieldInput,
  makeUrlFieldInput = (() => throwAlways) as unknown as typeof ui.makeUrlFieldInput,
  makeMultiselectFieldInput = (() => throwAlways) as unknown as typeof ui.makeMultiselectFieldInput
