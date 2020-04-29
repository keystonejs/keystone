/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
//import imageExtensions from 'image-extensions';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';
import { BlockMenuItem } from '@keystonejs/field-content/block-components';
import pluralize from 'pluralize';
import { useContentField } from '@keystonejs/field-content';

export const type = 'cloudinaryImage';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

const getFiles = () =>
  new Promise(resolve => {
    const input = document.createElement('input');
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
  Transforms.insertNodes(editor, {
    type,
    children: [
      {
        type: blocks.image.type,
        file,
        src,
        children: [{ text: '' }],
      },
      {
        type: blocks.caption.type,
        children: [{ text: '' }],
      },
    ],
  });
};

export const Sidebar = () => {
  const editor = useSlate();
  const { blocks } = useContentField();

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
};

const getImageStyle = alignment => {
  switch (alignment) {
    case 'left':
      return {
        float: 'left',
        marginRight: '10px',
        width: '50%',
      };
    case 'right':
      return {
        float: 'right',
        marginLeft: '10px',
        width: '50%',
      };
    case 'center':
      return {
        display: 'block',
        margin: '0px auto',
        width: '100%',
      };
  }
};

export const Node = ({ element: { alignment }, attributes, children }) => {
  const editor = useSlate();
  const { ImageAlignmentContext } = useContentField('image');

  return (
    <figure
      css={{ display: 'flex', flexDirection: 'column', ...getImageStyle(alignment) }}
      {...attributes}
    >
      <ImageAlignmentContext.Provider
        value={useMemo(
          () => ({
            alignment,
            onAlignmentChange: newAlignment => {
              Transforms.setNodes(
                editor,
                { alignment: newAlignment },
                { match: n => n.type === type }
              );
            },
          }),
          [alignment, editor]
        )}
      >
        {children}
      </ImageAlignmentContext.Provider>
    </figure>
  );
};

export const getPlugin = ({ blocks }) => editor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    if (Element.isElement(node) && node.type === type) {
      // Validate alignment
      if (!['left', 'center', 'right'].includes(node.alignment)) {
        Transforms.setNodes(editor, { alignment: 'center' }, { at: path });
        return;
      }

      const [image, caption] = node.children;

      // The image has been deleted so we also want to delete the image-container.
      if (image.type !== blocks.image.type) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }

      // The caption has been deleted.
      // The user probably doesn't want to delete the image;
      // They probably just wanted to remove everything in the caption,
      // so the caption gets removed, and we insert another caption
      if (caption.type !== blocks.caption.type) {
        /*
        Transforms.insertNodes(
          editor,
          { type: blocks.caption.type, children: [{ text: '' }] },
          { at: [...path, 1] }
        );
        */
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

export const serialize = ({ node, blocks }) => {
  // Find the 'image' child node
  const imageNode = node.children.find(child => child.type === blocks.image.type);

  if (!imageNode) {
    console.error('No image found in a cloudinaryImage block');
    return;
  }

  // zero out the data field to ensure we don't accidentally store the `file` as
  // a JSON blob
  const { file, src, ...rest } = imageNode;

  const { _joinIds: joinIds } = node;
  const mutations =
    joinIds && joinIds.length
      ? {
          connect: {
            id: joinIds[0],
          },
        }
      : {
          create: {
            image: file,
          },
        };

  return {
    mutations,
    node: {
      ...rest,
      align: node.alignment,
    },
  };
};

export const deserialize = ({ node, joins, blocks }) => {
  if (!joins || !joins.length) {
    console.error('No image data received when rehydrating cloudinaryImage block');
    return;
  }

  // Find the 'image' child node
  const imageNode = node.children.find(child => child.type === blocks.image.type);

  if (!imageNode) {
    console.error('No image found in a cloudinaryImage block');
    return;
  }

  Transforms.setNodes(editor, { src: joins[0].image.publicUrl }, { at: imageNode });

  return {
    ...node,
    alignment: joins[0].align,
  };
};
