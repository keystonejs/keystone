import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import bytes from 'bytes'
import express from 'express'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
      }),
    }),
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
