import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import fs from 'node:fs/promises'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({
        storage: {
          async put(key, stream) {
            await fs.writeFile(`public/images/${key}`, stream)
          },
          async delete(key) {
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
            await fs.writeFile(`public/files/${key}`, stream)
          },
          async delete(key) {
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
