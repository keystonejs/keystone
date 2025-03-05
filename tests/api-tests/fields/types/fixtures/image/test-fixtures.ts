import { image } from '@keystone-6/core/fields'
import { inMemoryStorageStrategy, prepareTestFile } from '../../../storage-utils'

export const fieldConfig = () => ({ storage: inMemoryStorageStrategy().storage })

export const name = 'Image'
export const typeFunction = image

export const exampleValue = () => prepareTestFile('keystone.jpg')
export const exampleValue2 = () => prepareTestFile('react.jpg')
export const createReturnedValue = 'jpg'
export const updateReturnedValue = createReturnedValue

export const supportsNullInput = true
export const supportsUnique = false
export const skipRequiredTest = true
export const fieldName = 'avatar'
export const subfieldName = 'extension'

export const getTestFields = () => ({
  avatar: image({
    storage: inMemoryStorageStrategy().storage,
  }),
})

export const initItems = () => [
  { avatar: prepareTestFile('graphql.jpg'), name: 'file0' },
  { avatar: prepareTestFile('keystone.jpg'), name: 'file1' },
  { avatar: prepareTestFile('react.jpg'), name: 'file2' },
  { avatar: prepareTestFile('thinkmill.jpg'), name: 'file3' },
  { avatar: prepareTestFile('thinkmill1.jpg'), name: 'file4' },
  { avatar: null, name: 'file5' },
  { avatar: null, name: 'file6' },
]

export const storedValues = () => [
  { avatar: { extension: 'jpg' }, name: 'file0' },
  { avatar: { extension: 'jpg' }, name: 'file1' },
  { avatar: { extension: 'jpg' }, name: 'file2' },
  { avatar: { extension: 'jpg' }, name: 'file3' },
  { avatar: { extension: 'jpg' }, name: 'file4' },
  { avatar: null, name: 'file5' },
  { avatar: null, name: 'file6' },
]
