// @ts-expect-error graphql-upload does not provide TypeScript declarations
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import bytes from 'bytes'
import express from 'express'
import fs from 'node:fs/promises'

export default config({
  db: {
    provider: 'sqlite',
    prismaClientOptions: () => ({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./keystone-example.db',
      }),
    }),
    async onConnect() {
      // `public/` is gitignored, so these directories do not exist in a fresh clone.
      await Promise.all([
        fs.mkdir('public/images', { recursive: true }),
        fs.mkdir('public/files', { recursive: true }),
      ])
    },
  },
  lists,
  server: {
    extendExpressApp: app => {
      app.use(graphqlUploadExpress({ maxFileSize: bytes('10Mb')!, maxFiles: 10 }))
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
