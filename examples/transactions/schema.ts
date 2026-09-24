import { gWithContext, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, integer, relationship, timestamp, virtual } from '@keystone-6/core/fields'
import type { Lists, Context } from './generated/keystone/types'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

export const extendGraphqlSchema = g.extend(base => {
  return {
    mutation: {
      submitOrder: g.field({
        type: base.object('Order'),
        args: {},
        async resolve(source, {}, context) {
          // TODO: this should come from GraphQL arguments
          const orderInput = [
            { sku: '123', count: 1 },
            { sku: '124', count: 5 },
            { sku: '125', count: 2 },
          ]

          return await context.transaction(async tx => {
            const assigned = []

            for (const { sku, count } of orderInput) {
              const items = await tx.db.Item.findMany({
                take: count,
                where: {
                  product: {
                    sku: {
                      equals: sku,
                    },
                  },
                  assignment: null,
                },
              })

              if (items.length !== count) throw new Error('Could not complete order')
              assigned.push(...items)
            }

            const order = await tx.db.Order.createOne({
              data: {
                items: {
                  connect: assigned.map(i => ({ id: i.id })),
                },
              },
            })

            return order
          })
        },
      }),
    },
  }
})

export const lists = {
  Order: list<Lists.Order.TypeInfo>({
    access: allowAll,
    hooks: {
      afterOperation: {
        create: async ({ context, item }) => {
          // Database consistency work stays inside submitOrder's transaction.
          await context.db.Order.updateOne({
            where: { id: item.id },
            data: { createdAt: new Date().toISOString() },
          })
        },
      },
      transaction: {
        afterCommit: {
          create: async ({ item }) => {
            // Optional external notification: never sent when submitOrder rolls back.
            const url = process.env.ORDER_NOTIFICATION_URL
            if (!url) return
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: item.id }),
            })
            if (!response.ok) throw new Error('Order committed, but notification failed')
          },
        },
        afterRollback: ({ error }) => {
          console.error('Order transaction rolled back', error)
        },
      },
    },
    fields: {
      items: relationship({ ref: 'Item.assignment', many: true }),
      createdAt: timestamp(),
    },
  }),

  Item: list<Lists.Item.TypeInfo>({
    access: allowAll,
    fields: {
      product: relationship({ ref: 'Product', many: false }),
      serialNumber: text(),

      assignment: relationship({ ref: 'Order.items', many: false }),
      addedAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),

  Product: list<Lists.Product.TypeInfo>({
    access: allowAll,
    fields: {
      sku: text(),
      description: text(),
      value: integer(),

      available: virtual({
        field: g.field({
          type: g.Int,
          resolve(item, args, context) {
            return context.db.Item.count({
              where: {
                product: {
                  id: {
                    equals: item.id,
                  },
                },
                assignment: null,
              },
            })
          },
        }),
      }),
    },
    ui: {
      labelField: 'description',
    },
  }),
}
