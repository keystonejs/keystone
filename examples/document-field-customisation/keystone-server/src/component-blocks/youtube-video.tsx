/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core'
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'

export const youtubeVideo = component({
  label: 'YouTube Video',
  schema: {
    url: fields.url({
      label: 'YouTube Video URL',
      defaultValue: 'https://www.youtube.com/watch?v=fPWRlmedCbo',
    }),
    altText: fields.text({
      label: 'Alt text',
      defaultValue: 'Embedded YouTube video',
    }),
  },
  preview: function YouTubeVideo (props) {
    const url = props.fields.url.value
    let embedId = ''
    const parsedUrl = (url || '')
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    if (parsedUrl[2] !== undefined) {
      const parsedId = parsedUrl[2].split(/[^0-9a-z_\-]/i)
      embedId = parsedId[0]
    } else {
      embedId = url
    }

    return (
      <NotEditable>
        <div
          css={{
            overflow: 'hidden',
            paddingBottom: '56.25%',
            position: 'relative',
            height: 0,
            ' iframe': { left: 0, top: 0, height: '100%', width: '100%', position: 'absolute' },
          }}
        >
          <iframe
            width="853"
            height="480"
            src={`https://www.youtube.com/embed/${embedId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={props.fields.altText.value}
          />
        </div>
      </NotEditable>
    )
  },
})
