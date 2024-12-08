import type http from 'http'
import { useServer as wsUseServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { PubSub } from 'graphql-subscriptions'
import { parse } from 'graphql'

import { type Context } from '.keystone/types'

// Setup pubsub as a Global variable in dev so it survives Hot Reloads.
declare global {
  var graphqlSubscriptionPubSub: PubSub
}

// The 'graphql-subscriptions' pubsub library is not recommended for production use, but can be useful as an example
//   for details see https://www.apollographql.com/docs/apollo-server/data/subscriptions/#the-pubsub-class
export const pubSub = global.graphqlSubscriptionPubSub || new PubSub()
globalThis.graphqlSubscriptionPubSub = pubSub

export function extendHttpServer (
  httpServer: http.Server,
  commonContext: Context,
) {
  // Setup WebSocket server using 'ws'
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/api/graphql',
  })

  // Setup the WebSocket to handle GraphQL subscriptions using 'graphql-ws'
  wsUseServer(
    {
      schema: commonContext.graphql.schema,
      // run these onSubscribe functions as needed or remove them if you don't need them
      onSubscribe: async (ctx: any, msg) => {
        const context = await commonContext.withRequest(ctx.extra.request)
        // Return the execution args for this subscription passing through the Keystone Context
        return {
          schema: commonContext.graphql.schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: context,
        }
      },
    },
    wss
  )

  // Send the time every second as an interval example of pub/sub
  setInterval(() => {
    console.log('TIME', Date.now())
    pubSub.publish('TIME', {
      time: {
        iso: new Date().toISOString(),
      },
    })
  }, 1000)
}
