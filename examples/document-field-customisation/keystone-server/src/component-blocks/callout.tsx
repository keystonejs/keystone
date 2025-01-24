import React from 'react'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

import { Callout, CalloutToolbar } from './callout-ui'

export const callout = component({
  preview: function (props) {
    return (
      <Callout tone={props.fields.tone.value}>
        {props.fields.content.element}
      </Callout>
    );
  },
  label: 'Callout',
  chromeless: true,
  schema: {
    tone: fields.select({
      label: 'Tone',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'caution', label: 'Caution' },
        { value: 'positive', label: 'Positive' },
        { value: 'critical', label: 'Critical' },
      ],
      defaultValue: 'info',
    }),
    content: fields.child({
      kind: 'block',
      placeholder: '',
      formatting: 'inherit',
      dividers: 'inherit',
      links: 'inherit',
    }),
  },
  toolbar({ props, onRemove }) {
    return (
      <CalloutToolbar
        onChange={tone => {
          props.fields.tone.onChange(tone);
        }}
        onRemove={onRemove}
        tone={props.fields.tone.value}
        tones={props.fields.tone.schema.options}
      />
    );
  },
});
