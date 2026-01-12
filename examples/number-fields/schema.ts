import { list, gWithContext } from '@keystone-6/core'
import { bigInt, float, integer, virtual } from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import type { Lists, Context } from '.keystone/types'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const lists = {
  Example: list({
    access: allowAll,
    fields: {
      bigInt: bigInt(),
      bigIntDefaulted: bigInt({ defaultValue: 123n }),
      // bigIntIncrementing: bigInt({ // WARNING: not supported by SQLite
      //  defaultValue: { kind: 'autoincrement' },
      // }),
      float: float(),
      floatDefaulted: float({ defaultValue: 456.321 }),
      integer: integer(),
      integerDefaulted: integer({ defaultValue: 789 }),
      // integerIncrementing: integer({ // WARNING: not supported by SQLite
      //   defaultValue: { kind: 'autoincrement' },
      //   db: {
      //     isNullable: false
      //   },
      // }),
      maximum: virtual({
        field: g.field({
          type: g.Int,
          resolve(x) {
            return Math.max(
              x.float ?? 0,
              x.floatDefaulted ?? 0,
              x.integer ?? 0,
              x.integerDefaulted ?? 0
            )
          },
        }),
      }),
    },
  }),
} satisfies Lists
