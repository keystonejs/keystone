import * as React from 'react';
import { getFiles } from '../utils';
import Image from '../Image';
import insertImages from 'slate-drop-or-paste-images';
import imageExtensions from 'image-extensions';

export let type = 'image';

let getFiles = () =>
  new Promise(resolve => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      let files = input.files;
      Promise.all(
        [...files].map(file => {
          return new Promise(innerResolve => {
            const reader = new FileReader();
            reader.onload = e => {
              innerResolve(e.target.result);
            };
            reader.readAsDataURL(file);
          });
        })
      ).then(resolve);
    };
    input.click();
  });

export function Sidebar({ editorRef }) {
  return (
    <button
      type="button"
      onClick={() => {
        getFiles().then(srcs => {
          srcs.forEach(src => {
            editorRef.current.insertBlock({
              type,
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

export let plugins = [
  insertImages({
    extensions: imageExtensions,
    insertImage: (editor, file) => {
      const reader = new FileReader();
      reader.onload = () => {
        editor.insertBlock({
          type,
          isVoid: true,
          data: { src: reader.result },
        });
      };
      reader.readAsDataURL(file);
    },
  }),
];
