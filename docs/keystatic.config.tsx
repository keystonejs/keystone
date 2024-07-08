// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core'
import { superscriptIcon } from '@keystar/ui/icon/icons/superscriptIcon'

import { inline, mark, wrapper } from '@keystatic/core/content-components'
// import { WellPreview } from './keystatic/admin-previews'

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'Keystone Website',
    },
  },
  collections: {
    docs: collection({
      label: 'Docs',
      path: 'content/docs/**',
      slugField: 'title',
      columns: ['title'],
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: {
            heading: {
              levels: [1, 2, 3, 4],
              schema: {
                id: fields.text({ label: 'ID' }),
              },
            },
          },
          components: {
            heading: wrapper({ label: 'Heading', schema: { id: fields.text({ label: 'ID' }) } }),
            well: wrapper({
              label: 'Well',
              schema: {
                heading: fields.text({ label: 'Heading' }),
                grad: fields.select({
                  label: 'Gradient',
                  options: [
                    { label: '1', value: 'grad1' },
                    { label: '2', value: 'grad2' },
                    { label: '3', value: 'grad3' },
                    { label: '4', value: 'grad4' },
                  ],
                  defaultValue: 'grad1',
                }),
                badge: fields.text({ label: 'Badge' }),
                href: fields.text({ label: 'Link href', validation: { isRequired: true } }),
                target: fields.select({
                  label: 'Link target',
                  description: 'Where should this link open?',
                  options: [
                    { label: 'New tab', value: '_blank' },
                    { label: 'Same tab', value: '' },
                  ],
                  defaultValue: '',
                }),
              },
              /* 
                Preview below doesn't work properly,
                but you can try enable it :)
              */

              // ContentView: (data) => <WellPreview {...data} />,
            }),
            hint: wrapper({
              label: 'Hint',
              schema: {
                kind: fields.select({
                  label: 'Kind',
                  options: [
                    { label: 'Tip', value: 'tip' },
                    { label: 'Warning', value: 'warn' },
                    { label: 'Error', value: 'error' },
                  ],
                  defaultValue: 'tip',
                }),
              },
            }),
            'related-content': wrapper({ label: 'Related Content', schema: {} }),
            sup: mark({ label: 'Superscript', schema: {}, icon: superscriptIcon, tag: 'sup' }),
            emoji: inline({
              label: 'Emoji',
              schema: {
                symbol: fields.text({ label: 'Symbol' }),
                alt: fields.text({ label: 'Alt' }),
              },
            }),
          },
        }),
      },
    }),

    // Blog
    posts: collection({
      path: 'content/blog/*',
      label: 'Blog',
      slugField: 'title',
      columns: ['title'],
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description' }),
        publishDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        authorName: fields.text({ label: 'Author Name', validation: { isRequired: true } }),
        authorHandle: fields.url({ label: 'Author Handle' }),
        metaImageUrl: fields.url({ label: 'Meta Image URL' }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
})
