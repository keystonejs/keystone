import { config } from '@keystone-6/core'
import { lists } from './schema'
import bytes from 'bytes'
import express from 'express'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  server: {
    maxFileSize: bytes('40Mb')!,
    extendExpressApp: app => {
      app.use(
        '/images',
        express.static('public/images', { index: false, redirect: false, lastModified: false })
      )
      app.use(
        '/files',
        express.static('public/files', {
          setHeaders(res) {
            res.setHeader('Content-Type', 'application/octet-stream')
          },
          index: false,
          redirect: false,
          lastModified: false,
        })
      )
    },
  },
})
