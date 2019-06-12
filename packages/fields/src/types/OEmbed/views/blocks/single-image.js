/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import * as image from '../../../Content/views/editor/blocks/image';
import * as caption from '../../../Content/views/editor/blocks/caption';
import insertImages from 'slate-drop-or-paste-images';
import imageExtensions from 'image-extensions';
import { findNode } from 'slate-react';
import { Block } from 'slate';
import pluralize from 'pluralize';

export const type = 'cloudinaryImage';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

let getFiles = () =>
  new Promise(resolve => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => resolve([...input.files]);
    input.click();
  });

const insertImageBlockFromFile = (editor, file) => {
  const reader = new FileReader();
  reader.onload = event => insertImageBlock(editor, file, event.target.result);
  reader.readAsDataURL(file);
};

const insertImageBlock = (editor, file, src) => {
  editor.insertBlock({
    type,
    nodes: [
      Block.create({
        type: image.type,
        data: { file, src },
      }),
    ],
  });
};

export function Sidebar({ editor }) {
  return (
    <button
      type="button"
      onClick={() => {
        getFiles().then(files => {
          files.forEach(file => insertImageBlockFromFile(editor, file));
        });
      }}
    >
      Insert Image
    </button>
  );
}

function getImageStyle(alignment) {
  if (alignment === 'left') {
    return {
      float: 'left',
      marginRight: '10px',
      width: '50%',
    };
  } else if (alignment === 'right') {
    return {
      float: 'right',
      marginLeft: '10px',
      width: '50%',
    };
  } else {
    return {
      display: 'block',
      margin: '0px auto',
      width: '100%',
    };
  }
}
export function Node(props) {
  let alignment = props.node.data.get('alignment');
  return (
    <figure
      css={{ display: 'flex', flexDirection: 'column', ...getImageStyle(alignment) }}
      {...props.attributes}
    >
      <image.ImageAlignmentContext.Provider
        value={useMemo(() => {
          return {
            alignment,
            onAlignmentChange(newAlignment) {
              props.editor.setNodeByKey(props.node.key, {
                data: props.node.data.set('alignment', newAlignment),
              });
            },
          };
        }, [props.node.key, alignment, props.editor, props.node.data])}
      >
        {props.children}
      </image.ImageAlignmentContext.Provider>
    </figure>
  );
}

export let schema = {
  nodes: [
    {
      match: [{ type: image.type }],
      min: 1,
      max: 1,
    },
    {
      match: [{ type: caption.type }],
      min: 1,
      max: 1,
    },
  ],
  normalize(editor, error) {
    switch (error.code) {
      case 'child_min_invalid': {
        if (error.index === 0) {
          // the image has been deleted so we also want to delete the image-container
          editor.removeNodeByKey(error.node.key);
        }
        if (error.index === 1) {
          // the caption has been deleted
          // the user probably doesn't want to delete the image
          // they probably just wanted to remove everything in the caption
          // so the caption gets removed,  we insert another caption
          editor.insertNodeByKey(error.node.key, 1, Block.create('caption'));
        }
        return;
      }
      case 'node_data_invalid': {
        if (error.key === 'alignment') {
          editor.setNodeByKey(error.node.key, {
            data: error.node.data.set('alignment', 'center'),
          });
        }
        return;
      }
    }
    console.log(error);
  },
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
};

export let plugins = [
  insertImages({
    extensions: imageExtensions,
    insertImage: insertImageBlockFromFile,
  }),
  {
    onDragStart(event, editor, next) {
      const { value } = editor;
      const { document } = value;
      const node = findNode(event.target, editor);
      if (node.type === image.type) {
        const ancestors = document.getAncestors(node.key);
        let imgContainer = ancestors.get(ancestors.size - 1);
        if (imgContainer.type === type) {
          editor.moveToRangeOfNode(imgContainer);
        }
      }

      next();
    },
  },
];

export function serialize({ node }) {
  // Find the 'image' child node
  const imageNode = node.findDescendant(
    child => child.object === 'block' && child.type === image.type
  );

  if (!imageNode) {
    console.error('No image found in a cloudinaryImage block');
    return;
  }

  const alignment = node.data.get('alignment');
  const file = imageNode.data.get('file');

  // zero out the data field to ensure we don't accidentally store the `file` as
  // a JSON blob
  const newNode = node.setNode(node.getPath(imageNode.key), { data: {} });

  return {
    mutations: {
      create: {
        image: file,
      },
    },
    node: {
      ...newNode.toJSON(),
      data: {
        align: alignment,
      },
    },
  };
}

export function deserialize({ node, joins }) {
  if (!joins || !joins.length) {
    console.error('No image data received when rehydrating cloudinaryImage block');
    return;
  }

  // Find the 'image' child node
  const imageNode = node.findDescendant(
    child => child.object === 'block' && child.type === image.type
  );

  if (!imageNode) {
    console.error('No image found in a cloudinaryImage block');
    return;
  }

  return (
    node
      // Inject the alignment back into the containing block
      .set('data', node.data.set('alignment', joins[0].align))
      // And the src attribute into the inner image
      .setNode(node.getPath(imageNode.key), {
        data: {
          src: joins[0].image.publicUrl,
        },
      })
  );
}
