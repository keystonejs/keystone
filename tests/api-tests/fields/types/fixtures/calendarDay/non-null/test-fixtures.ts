import { calendarDay } from '@keystone-6/core/fields'

export const name = 'calendarDay with isNullable: false'
export const typeFunction = (x: any) => calendarDay({ ...x, db: { ...x?.db, isNullable: false } })
export const exampleValue = () => '1990-12-31'
export const exampleValue2 = () => '2000-01-20'
export const supportsUnique = true
export const supportsGraphQLIsNonNull = true
export const supportsDbMap = true
export const fieldName = 'lastOnline'

export const getTestFields = () => ({ lastOnline: calendarDay({ db: { isNullable: false } }) })

export const initItems = () => {
  return [
    { name: 'person1', lastOnline: '1979-04-12' },
    { name: 'person2', lastOnline: '1980-10-01' },
    { name: 'person3', lastOnline: '1990-12-31' },
    { name: 'person4', lastOnline: '2000-01-20' },
    { name: 'person5', lastOnline: '2020-06-10' },
    { name: 'person6', lastOnline: '2020-06-10' },
    { name: 'person7', lastOnline: '2020-06-10' },
  ]
}

export const storedValues = () => [
  { name: 'person1', lastOnline: '1979-04-12' },
  { name: 'person2', lastOnline: '1980-10-01' },
  { name: 'person3', lastOnline: '1990-12-31' },
  { name: 'person4', lastOnline: '2000-01-20' },
  { name: 'person5', lastOnline: '2020-06-10' },
  { name: 'person6', lastOnline: '2020-06-10' },
  { name: 'person7', lastOnline: '2020-06-10' },
]
