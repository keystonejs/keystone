// this example is just for illustration purposes. in production you should likely use S3 or similar.

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import fs from 'node:fs/promises'

import type { Lists } from './generated/keystone/types'

function assertStrictStorageKey(key: string) {
  // note this is not strictly necessary because the default generateNames are:
  // - image: randomBytes(16).toString('base64url')
  // - file: replaces anything non alphanumeric with a dash and includes randomBytes(16).toString('base64url')
  // this is included to suggest that if you use a local storage strategy like this
  // you should be careful about what keys you allow to be written to the filesystem
  // particularly if you use a custom transformName function
  if (!/^[A-Za-z0-9_-]+\.?[A-Za-z0-9_-]*$/.test(key)) {
    throw new Error(`Invalid storage key`)
  }
}

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({
        storage: {
          async put(key, stream) {
            assertStrictStorageKey(key)
            await fs.writeFile(`public/images/${key}`, stream)
          },
          async delete(key) {
            assertStrictStorageKey(key)
            await fs.unlink(`public/images/${key}`)
          },
          url(key) {
            return `http://localhost:3000/images/${key}`
          },
        },
      }),
      attachment: file({
        storage: {
          async put(key, stream) {
            assertStrictStorageKey(key)
            await fs.writeFile(`public/files/${key}`, stream)
          },
          async delete(key) {
            assertStrictStorageKey(key)
            await fs.unlink(`public/files/${key}`)
          },
          url(key) {
            return `http://localhost:3000/files/${key}`
          },
        },
      }),
    },
  }),
} satisfies Lists
