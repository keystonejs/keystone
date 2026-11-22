import { bytes } from '@keystone-6/core/fields'
import { equalityFilterTests, filterTests } from './utils.ts'

filterTests(bytes(), match => {
  equalityFilterTests(match, ['00', '01', '0203', 'ff', 'ffff'], true)
})
