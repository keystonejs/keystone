import { file } from '@keystone-6/core/fields'
import { inMemoryStorageStrategy, prepareTestFile } from '../../../storage-utils'

export const name = 'File'
export const typeFunction = file

export const exampleValue = () => prepareTestFile('keystone.jpg')
export const exampleValue2 = () => prepareTestFile('react.jpg')
export const createReturnedValue = 3250
export const updateReturnedValue = 5562

export const supportsNullInput = true
export const supportsUnique = false
export const skipRequiredTest = true
export const fieldName = 'secretFile'
export const subfieldName = 'filesize'
export const fieldConfig = () => ({ storage: inMemoryStorageStrategy().storage })

export const getTestFields = () => ({
  secretFile: file({ storage: inMemoryStorageStrategy().storage }),
})

export const initItems = () => [
  { secretFile: prepareTestFile('graphql.jpg'), name: 'file0' },
  { secretFile: prepareTestFile('keystone.jpg'), name: 'file1' },
  { secretFile: prepareTestFile('react.jpg'), name: 'file2' },
  { secretFile: prepareTestFile('thinkmill.jpg'), name: 'file3' },
  { secretFile: prepareTestFile('thinkmill1.jpg'), name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
]

export const storedValues = () => [
  { secretFile: { filesize: 2759 }, name: 'file0' },
  { secretFile: { filesize: 3250 }, name: 'file1' },
  { secretFile: { filesize: 5562 }, name: 'file2' },
  { secretFile: { filesize: 1028 }, name: 'file3' },
  { secretFile: { filesize: 1028 }, name: 'file4' },
  { secretFile: null, name: 'file5' },
  { secretFile: null, name: 'file6' },
]
