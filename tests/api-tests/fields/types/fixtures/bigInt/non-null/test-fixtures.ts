import { bigInt } from '@keystone-6/core/fields'

export const name = 'BigInt with isNullable: false'
export const typeFunction = (x: any) => bigInt({ ...x, db: { ...x?.db, isNullable: false } })
export const exampleValue = () => '9223372036854775807'
export const exampleValue2 = () => '-9223372036854775808'
export const supportsGraphQLIsNonNull = true
export const supportsDbMap = true
export const supportsUnique = true
export const fieldName = 'testField'

export const getTestFields = () => ({ testField: bigInt({ db: { isNullable: false } }) })

export const initItems = () => {
  return [
    { name: 'value1', testField: '9223372036854775807' },
    { name: 'value2', testField: '-9223372036854775808' },
    { name: 'value3', testField: '-1' },
    { name: 'value4', testField: '0' },
    { name: 'value5', testField: '65536' },
    { name: 'value6', testField: '3452345324523145' },
    { name: 'value7', testField: '732472358259' },
  ]
}

export const storedValues = () => [
  { name: 'value1', testField: '9223372036854775807' },
  { name: 'value2', testField: '-9223372036854775808' },
  { name: 'value3', testField: '-1' },
  { name: 'value4', testField: '0' },
  { name: 'value5', testField: '65536' },
  { name: 'value6', testField: '3452345324523145' },
  { name: 'value7', testField: '732472358259' },
]
