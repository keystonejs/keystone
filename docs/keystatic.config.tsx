import { config, fields, collection, singleton } from '@keystatic/core'
import { superscriptIcon } from '@keystar/ui/icon/icons/superscriptIcon'
import { mark, wrapper } from '@keystatic/core/content-components'
import { cableIcon } from '@keystar/ui/icon/icons/cableIcon'
import { creditCardIcon } from '@keystar/ui/icon/icons/creditCardIcon'

import { emoji, hint } from './keystatic/content-components'
import { gradientSelector } from './keystatic/gradient-selector'

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'Keystone Website',
    },
    navigation: {
      Pages: ['docs', 'posts', 'examples'],
      Config: ['navigation', 'featuredDocs', 'featuredExamples'],
    },
  },
  collections: {
    // ------------------------------
    // Docs
    // ------------------------------
    docs: collection({
      label: 'Docs Pages',
      path: 'content/docs/**',
      slugField: 'title',
      columns: ['title'],
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description', validation: { isRequired: true } }),
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
              icon: creditCardIcon,
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
            hint: hint(),
            'related-content': wrapper({ label: 'Related Content', icon: cableIcon, schema: {} }),
            sup: mark({ label: 'Superscript', schema: {}, icon: superscriptIcon, tag: 'sup' }),
            emoji: emoji(),
          },
        }),
      },
    }),

    // ------------------------------
    // Blog
    // ------------------------------
    posts: collection({
      label: 'Blog Posts',
      path: 'content/blog/*',
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
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          components: {
            hint: hint('Callout'),
            emoji: emoji(),
          },
        }),
      },
    }),

    // ------------------------------
    // Examples
    // ------------------------------
    examples: collection({
      label: 'GitHub Examples',
      path: 'content/examples/*',
      slugField: 'title',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kind: fields.select({
          label: 'Example Kind',
          options: [
            { label: 'Standalone', value: 'standalone' },
            { label: 'End-to-End', value: 'end-to-end' },
            { label: 'Deployment', value: 'deployment' },
          ],
          defaultValue: 'standalone',
        }),
        url: fields.text({
          label: 'URL',
          validation: { isRequired: true },
        }),
        description: fields.markdoc.inline({ label: 'Description' }),
      },
    }),
  },
  singletons: {
    // ------------------------------
    // Navigation
    // ------------------------------
    navigation: singleton({
      label: 'Docs Sidebar Navigation',
      path: 'content/navigation',
      schema: {
        navGroups: fields.array(
          fields.object({
            groupName: fields.text({ label: 'Group name' }),
            items: fields.array(
              fields.object({
                label: fields.text({
                  label: 'Label',
                  description: "Required when using a URL, or overriding the page's title",
                }),
                link: fields.conditional(
                  fields.select({
                    label: 'Link type',
                    options: [
                      { label: 'Page', value: 'page' },
                      { label: 'URL', value: 'url' },
                    ],
                    defaultValue: 'page',
                  }),
                  {
                    page: fields.relationship({
                      label: 'Docs Page',
                      collection: 'docs',
                    }),
                    url: fields.text({ label: 'URL' }),
                  }
                ),
                status: fields.select({
                  label: 'Status',
                  options: [
                    { label: 'Default', value: 'default' },
                    { label: 'New', value: 'new' },
                    { label: 'Updated', value: 'updated' },
                  ],
                  defaultValue: 'default',
                }),
              }),
              {
                label: 'Navigation items',
                itemLabel: (props) => props.fields.label.value,
              }
            ),
          }),
          {
            label: 'Navigation groups',
            itemLabel: (props) => props.fields.groupName.value,
          }
        ),
      },
    }),

    // ------------------------------
    // Featured Docs
    // ------------------------------
    featuredDocs: singleton({
      label: 'Featured Docs',
      path: 'content/featured-docs',
      schema: {
        groups: fields.array(
          fields.object({
            groupName: fields.text({ label: 'Group name' }),
            groupDescription: fields.markdoc.inline({ label: 'Group description' }),
            gradient: gradientSelector({ defaultValue: 'grad1' }),
            items: fields.array(
              fields.object({
                label: fields.text({
                  label: 'Label',
                  description: "Required when using a URL, or overriding the page's title",
                  validation: { isRequired: true },
                }),
                link: fields.conditional(
                  fields.select({
                    label: 'Link type',
                    options: [
                      { label: 'Docs Page', value: 'docs' },
                      { label: 'URL', value: 'url' },
                    ],
                    defaultValue: 'docs',
                  }),
                  {
                    docs: fields.object(
                      {
                        docPage: fields.relationship({
                          label: 'Docs Page',
                          collection: 'docs',
                        }),
                        description: fields.markdoc.inline({ label: 'Description' }),
                      },
                      {
                        label: 'Docs Page',
                      }
                    ),
                    url: fields.object({
                      url: fields.text({ label: 'URL' }),
                      description: fields.markdoc.inline({ label: 'Description' }),
                    }),
                  }
                ),
              }),
              {
                label: 'Featured Items',
                itemLabel: (props) =>
                  `${props.fields.label.value} — [${props.fields.link.discriminant}]`,
              }
            ),
          }),
          {
            label: 'Featured Groups',
            itemLabel: (props) => props.fields.groupName.value,
          }
        ),
      },
    }),

    featuredExamples: singleton({
      label: 'Featured Examples',
      path: 'content/featured-examples',
      schema: {
        label: fields.text({ label: 'Label' }),
        description: fields.markdoc.inline({ label: 'Group description' }),
        gradient: gradientSelector({ defaultValue: 'grad1' }),
        items: fields.multiRelationship({ label: 'Examples List', collection: 'examples' }),
      },
    }),
  },
})
