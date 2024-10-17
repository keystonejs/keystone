import { config } from '@keystone-6/core'
import { lists } from './schema'
import bytes from 'bytes'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  server: {
    maxFileSize: bytes('40Mb')
  },
  storage: {
    my_images: {
      kind: 'local',
      type: 'image',
      generateUrl: path => `http://localhost:3000/images${path}`,
      serverRoute: {
        path: '/images',
      },
      storagePath: 'public/images',
    },
    my_files: {
      kind: 'local',
      type: 'file',
      generateUrl: path => `http://localhost:3000/files${path}`,
      serverRoute: {
        path: '/files',
      },
      storagePath: 'public/files',
    },
  },
})
