/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks';

export const quote = component({
  label: 'Quote',
  schema: {
    content: fields.child({
      kind: 'block',
      placeholder: 'Quote...',
      formatting: { inlineMarks: 'inherit', softBreaks: 'inherit', alignment: 'inherit' },
      links: 'inherit',
    }),
    attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
  },
  preview: function Quote(props) {
    return (
      <div
        css={{
          paddingLeft: 16,
          backgroundColor: '#f3f5f6',
          padding: '4px 12px 16px 48px',
          position: 'relative',
          borderRadius: 6,
          ':after': {
            content: '"\\201C"',
            position: 'absolute',
            top: 0,
            left: 16,
            fontSize: '4rem',
          },
        }}
      >
        <div css={{ fontStyle: 'italic', color: '#4A5568' }}>{props.fields.content.element}</div>
        <div css={{ fontWeight: 'bold', color: '#47546b' }}>
          <NotEditable>— </NotEditable>
          {props.fields.attribution.element}
        </div>
      </div>
    );
  },
});
