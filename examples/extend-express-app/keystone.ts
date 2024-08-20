import { config } from '@keystone-6/core'

import { lists } from './schema'
import {
  type TypeInfo,
} from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  server: {
    extendExpressApp: (app, commonContext) => {
      // this example HTTP GET handler retrieves any posts in the database for your context
      //   with an optional request query parameter of `draft=1`
      //   returning them as JSON
      //
      // e.g
      //   http://localhost:3000/rest/posts
      //   http://localhost:3000/rest/posts?draft=1
      //
      app.get('/rest/posts', async (req, res) => {
        const context = await commonContext.withRequest(req, res)
        // if (!context.session) return res.status(401).end()

        const isDraft = req.query?.draft === '1'
        const tasks = await context.query.Post.findMany({
          where: {
            draft: {
              equals: isDraft
            },
          },
          query: `
            id
            title
            content
          `,
        })

        res.json(tasks)
      })
    },

    extendHttpServer: (server, commonContext) => {
      // e.g
      //   http://localhost:3000/rest/posts/clu7x6ch90002a89s6l63bjb5
      //
      server.on('request', async (req, res) => {
        if (!req.url?.startsWith('/rest/posts/')) return

        // this example HTTP GET handler retrieves a post in the database for your context
        //   returning it as JSON
        const context = await commonContext.withRequest(req, res)
        // if (!context.session) return res.status(401).end()

        const task = await context.query.Post.findOne({
          where: {
            id: req.url.slice('/rest/posts/'.length)
          },
          query: `
            id
            title
            content
            draft
          `,
        })

        if (!task) return res.writeHead(404).end()
        res.writeHead(200).end(JSON.stringify(task))
      })
    },
  },
  lists,
})
