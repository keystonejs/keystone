import { fields } from '@keystone-6/fields-document/component-blocks'

export { carousel } from './carousel'
export { hero } from './hero'
export { quote } from './quote'
export { tweet } from './tweet'
export { youtubeVideo } from './youtube-video'

export const callout = {
  schema: {
    intent: fields.select({
      label: 'Intent',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' },
        { value: 'success', label: 'Success' },
      ] as const,
      defaultValue: 'info',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: '',
      formatting: 'inherit',
      dividers: 'inherit',
      links: 'inherit',
      relationships: 'inherit',
    }),
  },
}
