import { checkbox } from '@keystone-6/core/fields'
import { filterTests } from './utils'

filterTests(checkbox(), match => {
  const values = [true, false]
  match(values, { equals: true }, [0])
  match(values, { equals: false }, [1])
  match(values, { not: { equals: true } }, [1])
  match(values, { not: { equals: false } }, [0])
})
