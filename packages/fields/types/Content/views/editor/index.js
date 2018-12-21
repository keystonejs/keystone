/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useCallback, useRef, Fragment, useLayoutEffect } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { getVisibleSelectionRect } from 'get-selection-range';
import { createPortal } from 'react-dom';
import { useScrollListener, useWindowSize } from './hooks';
import { marks, markTypes, plugins as markPlugins } from './marks';
import { LinkMenu } from './LinkMenu';
import {
  linkType,
  blockquoteType,
  orderedListType,
  unorderedListType,
  listItemType,
  defaultType,
  imageType,
  embedType,
  headingType,
  captionType,
} from './constants';
import AddBlock from './AddBlock';
import insertImages from 'slate-drop-or-paste-images';
import placeholderPlugin from 'slate-react-placeholder';
import imageExtensions from 'image-extensions';
import { hasBlock, hasAncestorBlock } from './utils';
import { blockPlugins } from './blocks';

let preventDefault = e => {
  e.preventDefault();
};

let ToolbarButton = ({ isActive, ...props }) => {
  return (
    <button
      type="button"
      // prevent the text from being deselected when the user clicks the button
      onMouseDown={preventDefault}
      {...(typeof isActive === 'boolean'
        ? {
            role: 'checkbox',
            'aria-checked': isActive,
          }
        : {})}
      css={{ color: isActive ? 'lightgreen' : 'black' }}
      {...props}
    />
  );
};

let normalizeImage = (editor, { code, node, key, child, ...other }) => {
  console.log(code, { code, node, key, child, ...other });
  switch (code) {
    case 'node_data_invalid': {
      if (key === 'alignment') {
        editor.setNodeByKey(node.key, {
          data: node.data.set('alignment', 'center'),
        });
      }
      return;
    }
    case 'next_sibling_type_invalid': {
      const caption = Block.create(captionType);
      editor.insertNodeByKey(
        editor.value.document.key,
        editor.value.document.getBlocks().findIndex(block => block.key === child.key) + 1,
        caption
      );
    }
  }
};

let alignmentValidator = value => value === 'center' || value === 'left' || value === 'right';

const schema = {
  document: {
    last: { type: defaultType },
    normalize: (editor, { code, node }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create(defaultType);
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph);
        }
      }
    },
  },
  blocks: {
    [imageType]: {
      isVoid: true,
      data: {
        alignment: alignmentValidator,
      },
      next: { type: captionType },
      normalize: normalizeImage,
    },
    [embedType]: {
      isVoid: true,
    },
    [captionType]: {
      previous: [{ type: imageType }],
      normalize(editor, { child }) {
        editor.removeNodeByKey(child.key);
      },
    },
  },
};

let plugins = [
  ...markPlugins,
  ...blockPlugins,
  insertImages({
    extensions: imageExtensions,
    insertImage: (editor, file) => {
      const reader = new FileReader();
      reader.onload = () => {
        editor.insertBlock({
          type: 'image',
          isVoid: true,
          data: { src: reader.result },
        });
      };
      reader.readAsDataURL(file);
    },
  }),
  placeholderPlugin({
    placeholder: 'Enter a caption... (optional)',
    when(editor, node) {
      return node.type === captionType && node.text === '';
    },
  }),
];

function Stories({ value: editorState, onChange }) {
  let windowSize = useWindowSize();

  let [linkRange, setLinkRange] = useState(null);
  let toolbarContainerRef = useRef(null);
  let editorRef = useRef(null);

  let positionToolbar = useCallback(
    () => {
      let toolbarContainer = toolbarContainerRef.current;
      const rect = getVisibleSelectionRect();
      if (!rect || rect.width === 0) {
        toolbarContainer.style.display = 'none';
        setLinkRange(null);
        return;
      }
      toolbarContainer.style.display = 'block';
      const left = rect.left + rect.width / 2 - toolbarContainer.offsetWidth / 2 + window.scrollX;
      toolbarContainer.style.transform = `translateX(${Math.max(
        Math.min(left, windowSize.innerWidth - toolbarContainer.offsetWidth),
        0
      )}px) translateY(${rect.top - toolbarContainer.offsetHeight + window.scrollY}px)`;
    },
    [toolbarContainerRef, windowSize]
  );

  let hasBlockquote = hasAncestorBlock(editorState, blockquoteType);
  let hasLinks = editorState.inlines.some(inline => inline.type == linkType);
  useLayoutEffect(positionToolbar, [linkRange, editorState]);
  useScrollListener(positionToolbar);

  let handleListButtonClick = type => {
    let editor = editorRef.current;

    let isList = hasBlock(editorState, listItemType);
    let isOrderedList = hasAncestorBlock(editorState, type);

    let otherListType = type === orderedListType ? unorderedListType : orderedListType;

    if (isList && isOrderedList) {
      editor.setBlocks(defaultType);
      editor.unwrapBlock(type);
    } else if (isList) {
      editor.unwrapBlock(otherListType);
      editor.wrapBlock(type);
    } else {
      editor.setBlocks(listItemType).wrapBlock(type);
    }
  };

  return (
    <Fragment>
      <Editor
        schema={schema}
        ref={editorRef}
        plugins={plugins}
        value={editorState}
        onChange={({ value }) => {
          onChange(value);
        }}
        onKeyDown={(event, editor, next) => {
          // make it so when you press enter after typing a heading,
          // the block type will change to a paragraph
          if (
            event.keyCode === 13 &&
            editorState.blocks.every(block => block.type === headingType)
          ) {
            editor.splitBlock().setBlocks(defaultType);
            return;
          }
          return next();
        }}
      />
      <AddBlock editorRef={editorRef} editorState={editorState} />
      {createPortal(
        <div
          ref={toolbarContainerRef}
          css={{
            backgroundColor: 'black',
            padding: 8,
            borderRadius: 8,
            width: 'auto',
            position: 'absolute',
            display: 'none',
            left: 0,
            top: 0,
            // this isn't as nice of a transition as i'd like since the time is fixed
            // i think it would better if it was physics based but that would probably
            // be a lot of work for little gain
            // maybe base the transition time on the previous value?
            transition: 'transform 100ms',
          }}
        >
          {linkRange !== null ? (
            <LinkMenu
              onSubmit={value => {
                editorRef.current.wrapInlineAtRange(linkRange, {
                  type: linkType,
                  data: { href: value },
                });
                // idk why the setTimeout is necessary but it works so ¯\_(ツ)_/¯
                setTimeout(() => setLinkRange(null), 0);
              }}
              onCancel={() => {
                setLinkRange(null);
              }}
            />
          ) : (
            <Fragment>
              {Object.keys(marks).map(name => {
                return (
                  <ToolbarButton
                    isActive={editorState.activeMarks.some(mark => mark.type === name)}
                    onClick={() => {
                      editorRef.current.toggleMark(name);
                    }}
                    key={name}
                  >
                    {name}
                  </ToolbarButton>
                );
              })}
              <ToolbarButton
                onClick={() => {
                  markTypes.forEach(mark => {
                    editorRef.current.removeMark(mark);
                  });
                }}
              >
                Remove Formatting
              </ToolbarButton>

              <ToolbarButton
                isActive={hasLinks}
                onClick={() => {
                  if (hasLinks) {
                    editorRef.current.unwrapInline(linkType);
                  } else {
                    setLinkRange(editorState.selection);
                  }
                }}
              >
                link
              </ToolbarButton>
              <ToolbarButton
                isActive={hasBlockquote}
                onClick={() => {
                  if (hasBlockquote) {
                    editorRef.current.unwrapBlock(blockquoteType);
                  } else {
                    editorRef.current.wrapBlock(blockquoteType);
                  }
                }}
              >
                blockquote
              </ToolbarButton>
              <ToolbarButton
                isActive={hasBlock(editorState, headingType)}
                onClick={() => {
                  if (hasBlock(editorState, headingType)) {
                    editorRef.current.setBlocks({ type: defaultType });
                  } else {
                    if (hasBlockquote) {
                      editorRef.current.unwrapBlock(blockquoteType);
                    }
                    editorRef.current.setBlocks({ type: headingType });
                  }
                }}
              >
                heading
              </ToolbarButton>
              <ToolbarButton
                isActive={hasAncestorBlock(editorState, orderedListType)}
                onClick={() => {
                  handleListButtonClick(orderedListType);
                }}
              >
                ordered list
              </ToolbarButton>
              <ToolbarButton
                isActive={hasAncestorBlock(editorState, unorderedListType)}
                onClick={() => {
                  handleListButtonClick(unorderedListType);
                }}
              >
                unordered list
              </ToolbarButton>
            </Fragment>
          )}
        </div>,
        document.body
      )}
    </Fragment>
  );
}

export default Stories;
