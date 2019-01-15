/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import Image from '../Image';

export let type = 'image';

export let ImageAlignmentContext = React.createContext({
  aligment: '',
  onAlignmentChange() {},
});

export function Node(props) {
  let { data } = props.node;
  let { aligment, onAlignmentChange } = React.useContext(ImageAlignmentContext);
  return (
    <Image
      alignment={aligment}
      attributes={props.attributes}
      isFocused={props.isFocused}
      src={data.get('src')}
      onAlignmentChange={onAlignmentChange}
    />
  );
}

export let schema = {
  isVoid: true,
  data: {
    alignment(value) {
      switch (value) {
        case 'center':
        case 'left':
        case 'right': {
          return true;
        }
      }
      return false;
    },
  },
  normalize(editor, { code, node, key }) {
    switch (code) {
      case 'node_data_invalid': {
        if (key === 'alignment') {
          editor.setNodeByKey(node.key, {
            data: node.data.set('alignment', 'center'),
          });
        }
      }
    }
  },
};
