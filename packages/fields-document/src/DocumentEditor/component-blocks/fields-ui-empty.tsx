function throwAlways(): never {
  throw new Error('React components from @keystone-6/fields-document/component-blocks cannot be rendered on the server');
}

export const TextField = throwAlways,
Checkbox = throwAlways,
Text = throwAlways,
makeIntegerFieldInput = () => throwAlways,
makeSelectFieldInput = () => throwAlways,
makeUrlFieldInput = () => throwAlways;