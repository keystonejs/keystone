import { password } from '@keystone-6/core/fields'
import { filterTests } from './utils'

// note that while password fields can be non-nullable
// non-nullable password fields cannot be filtered
// so that's why we're not testing non-nullable password fields here
filterTests(password(), match => {
  const values = [null, 'some password', 'another password']
  match(values, { isSet: false }, [0])
  match(values, { isSet: true }, [1, 2])
})
