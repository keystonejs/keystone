import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'
import { cloudinaryImage } from '@keystone-6/cloudinary'

import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: cloudinaryImage({
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
          apiKey: process.env.CLOUDINARY_API_KEY ?? '',
          apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
          folder: '/banners',
        },
      }),
    },
  }),
} satisfies Lists
