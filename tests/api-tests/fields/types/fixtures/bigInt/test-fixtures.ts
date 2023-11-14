import { bigInt } from '@keystone-6/core/fields'

export const name = 'BigInt'
export const typeFunction = bigInt
export const exampleValue = () => '9223372036854775807'
export const exampleValue2 = () => '-9223372036854775808'
export const supportsNullInput = true
export const supportsUnique = true
export const supportsDbMap = true
export const fieldName = 'testField'

export const getTestFields = () => ({
  testField: bigInt(),
})

export const initItems = () => {
  return [
    { name: 'value1', testField: '9223372036854775807' },
    { name: 'value2', testField: '-9223372036854775808' },
    { name: 'value3', testField: '-1' },
    { name: 'value4', testField: '0' },
    { name: 'value5', testField: '65536' },
    { name: 'value6', testField: null },
    { name: 'value7' },
  ]
}

export const storedValues = () => [
  { name: 'value1', testField: '9223372036854775807' },
  { name: 'value2', testField: '-9223372036854775808' },
  { name: 'value3', testField: '-1' },
  { name: 'value4', testField: '0' },
  { name: 'value5', testField: '65536' },
  { name: 'value6', price: null },
  { name: 'value7', price: null },
]
