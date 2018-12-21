import * as React from 'react';
import { getFiles } from '../utils';
import { imageType } from '../constants';
import Image from '../Image';

export function Sidebar({ editorRef }) {
  return (
    <button
      type="button"
      onClick={() => {
        getFiles().then(srcs => {
          srcs.forEach(src => {
            editorRef.current.insertBlock({
              type: imageType,
              data: { src },
            });
          });
        });
      }}
    >
      Insert Image
    </button>
  );
}
export function renderNode(props, editor) {
  let { data } = props.node;

  return (
    <Image
      alignment={data.get('alignment')}
      attributes={props.attributes}
      isFocused={props.isFocused}
      src={data.get('src')}
      onAlignmentChange={aligment => {
        editor.setNodeByKey(props.node.key, {
          data: data.set('alignment', aligment),
        });
      }}
    />
  );
}
