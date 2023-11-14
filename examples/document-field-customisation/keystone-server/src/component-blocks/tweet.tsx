/** @jsxRuntime classic */
/** @jsx jsx */

import { useRef, useEffect } from 'react'
import { jsx } from '@keystone-ui/core'
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'

export const tweet = component({
  label: 'Tweet',
  schema: {
    url: fields.url({
      label: 'Tweet URL',
      defaultValue:
        'https://twitter.com/KeystoneJS/status/1558944015953068032?s=20&t=32A2Avz9kPlefEOcXIqOXQ',
    }),
  },
  preview: function Tweet (props) {
    const wrapper = useRef<HTMLQuoteElement>(null)

    useEffect(() => {
      const script = document.createElement('script')
      script.setAttribute('src', 'https://platform.twitter.com/widgets.js')
      wrapper.current!.appendChild(script)
    }, [])

    return (
      <NotEditable>
        <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <blockquote ref={wrapper} className="twitter-tweet" data-conversation="none">
            <a href={props.fields.url.value}>Loading tweet...</a>
          </blockquote>
        </div>
      </NotEditable>
    )
  },
})
