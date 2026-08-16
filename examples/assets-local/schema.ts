import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Lists } from './generated/keystone/types'

function validateStorageKey(key: string): boolean {
  const normalized = path.normalize(key)
  if (path.isAbsolute(normalized)) return false
  if (normalized.startsWith('..')) return false
  if (normalized.includes(path.sep + '..')) return false
  if (/^[a-zA-Z]:/.test(normalized)) return false
  return true
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
            if (!validateStorageKey(key)) {
              throw new Error('Invalid storage key: path traversal detected')
            }
            await fs.writeFile(`public/images/${key}`, stream)
          },
          async delete(key) {
            if (!validateStorageKey(key)) {
              throw new Error('Invalid storage key: path traversal detected')
            }
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
            if (!validateStorageKey(key)) {
              throw new Error('Invalid storage key: path traversal detected')
            }
            await fs.writeFile(`public/files/${key}`, stream)
          },
          async delete(key) {
            if (!validateStorageKey(key)) {
              throw new Error('Invalid storage key: path traversal detected')
            }
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
