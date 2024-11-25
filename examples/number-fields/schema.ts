import { list, graphql } from '@keystone-6/core'
import {
  bigInt,
  float,
  integer,
  virtual
} from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import type { Lists } from '.keystone/types'

export const lists = {
  Example: list({
    access: allowAll,
    fields: {
      bigInt: bigInt(),
      bigIntDefaulted: bigInt({ defaultValue: 123n }),
      float: float(),
      floatDefaulted: float({ defaultValue: 456.321 }),
      integer: integer(),
      integerDefaulted: integer({ defaultValue: 789 }),
      maximum: virtual({
        field: graphql.field({
          type: graphql.Int,
          resolve (x) {
            return Math.max(
              x.float ?? 0,
              x.floatDefaulted ?? 0,
              x.integer ?? 0,
              x.integerDefaulted ?? 0,
            )
          },
        }),
      }),
    },
  }),
} satisfies Lists
