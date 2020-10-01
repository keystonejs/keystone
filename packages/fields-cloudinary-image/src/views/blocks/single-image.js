/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import insertImages from 'slate-drop-or-paste-images';
import imageExtensions from 'image-extensions';
import { findNode } from 'slate-react';
import { Data, Block } from 'slate';
import { BlockMenuItem } from '@keystonejs/fields-content/block-components';

export const type = 'cloudinaryImage';
export const path = 'cloudinaryImages';

let getFiles = () =>
  new Promise(resolve => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => resolve([...input.files]);
    input.click();
  });

const insertImageBlockFromFile = (blocks, editor, file) => {
  const reader = new FileReader();
  reader.onload = event => insertImageBlock(blocks, editor, file, event.target.result);
  reader.readAsDataURL(file);
};

const insertImageBlock = (blocks, editor, file, src) => {
  editor.insertBlock({
    type,
    nodes: [
      Block.create({
        type: blocks.image.type,
        data: { file, src },
      }),
    ],
  });
};

export function Sidebar({ editor, blocks }) {
  const icon = (
    <svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path d="M480 416v16c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V176c0-26.51 21.49-48 48-48h16v208c0 44.112 35.888 80 80 80h336zm96-80V80c0-26.51-21.49-48-48-48H144c-26.51 0-48 21.49-48 48v256c0 26.51 21.49 48 48 48h384c26.51 0 48-21.49 48-48zM256 128c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-96 144l55.515-55.515c4.686-4.686 12.284-4.686 16.971 0L272 256l135.515-135.515c4.686-4.686 12.284-4.686 16.971 0L512 208v112H160v-48z" />
    </svg>
  );
  return (
    <BlockMenuItem
      icon={icon}
      text="Insert Image"
      insertBlock={() => {
        getFiles().then(files => {
          files.forEach(file => insertImageBlockFromFile(blocks, editor, file));
        });
      }}
    />
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
      <props.blocks.image.ImageAlignmentContext.Provider
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
      </props.blocks.image.ImageAlignmentContext.Provider>
    </figure>
  );
}

export let getSchema = ({ blocks }) => ({
  nodes: [
    {
      match: [{ type: blocks.image.type }],
      min: 1,
      max: 1,
    },
    {
      match: [{ type: blocks.caption.type }],
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
});

export let getPlugins = ({ blocks }) => [
  insertImages({
    extensions: imageExtensions,
    insertImage: insertImageBlockFromFile.bind(null, blocks),
  }),
  {
    onDragStart(event, editor, next) {
      const { value } = editor;
      const { document } = value;
      const node = findNode(event.target, editor);
      if (node.type === blocks.image.type) {
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

export function serialize({ node, blocks }) {
  // Find the 'image' child node
  const imageNode = node.findDescendant(
    child => child.object === 'block' && child.type === blocks.image.type
  );

  if (!imageNode) {
    console.error('No image found in a cloudinaryImage block');
    return;
  }

  const joinIds = node.data.get('_joinIds');
  const alignment = node.data.get('alignment');
  const file = imageNode.data.get('file');

  // zero out the data field to ensure we don't accidentally store the `file` as
  // a JSON blob
  const newNode = node.setNode(node.getPath(imageNode.key), { data: Data.create() });

  const mutations =
    joinIds && joinIds.length
      ? {
          connect: { id: joinIds[0] },
        }
      : {
          create: {
            image: file,
          },
        };

  return {
    mutations,
    node: {
      ...newNode.toJSON(),
      data: {
        align: alignment,
      },
    },
  };
}

export function deserialize({ node, joins, blocks }) {
  if (!joins || !joins.length) {
    console.error('No image data received when rehydrating cloudinaryImage block');
    return;
  }

  // Find the 'image' child node
  const imageNode = node.findDescendant(
    child => child.object === 'block' && child.type === blocks.image.type
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
        data: imageNode.data.set('src', joins[0].image.publicUrl),
      })
  );
}
