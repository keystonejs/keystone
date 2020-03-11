/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useCallback } from 'react';

import { createEditor, Editor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { markArray } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './add-block';
import Toolbar from './toolbar';

function SlateEditor({ value: editorState, onChange, blocks, className, id, autoFocus }) {
  //console.log(blocks);

  const editor = useMemo(() => {
    const blockPlugins = Object.values(blocks).reduce((combinedBlockPlugins, { getPluginsNew }) => {
      return getPluginsNew
        ? [...combinedBlockPlugins, ...getPluginsNew({ blocks })]
        : combinedBlockPlugins;
    }, []);

    // Compose plugins. See https://docs.slatejs.org/concepts/07-plugins.
    return [withReact, withHistory, ...blockPlugins].reduce(
      (composition, plugin) => plugin(composition),
      createEditor()
    );
  }, [blocks]);

  const renderElement = useCallback(
    props => {
      const { [props.element.type]: { Node: ElementNode } = {} } = blocks;
      if (ElementNode) {
        return <ElementNode {...props} blocks={blocks} />;
      }

      return null;
    },
    [blocks]
  );

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    return (
      <span {...attributes}>
        {markArray.reduce((res, [type, { render }]) => {
          if (leaf[type] === true) {
            res = render(res);
          }

          return res;
        }, children)}
      </span>
    );
  }, []);

  const onKeyDown = useCallback(
    event => {
      markArray.forEach(([type, { test }]) => {
        if (test(event)) {
          event.preventDefault();

          if (Editor.marks(editor)[type] === true) {
            Editor.removeMark(editor, type);
          } else {
            Editor.addMark(editor, type, true);
          }
        }
      });
    },
    [editor]
  );

  return (
    <div className={className} css={{ position: 'relative' }} id={id}>
      <Slate editor={editor} value={editorState} onChange={onChange}>
        <Editable
          autoFocus={autoFocus}
          placeholder="Enter text"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          style={{ minHeight: 'inherit', padding: '16px 32px' }}
        />
        {/*
        <AddBlock editorState={editorState} blocks={blocks} />
        <Toolbar {...{ editorState, blocks }} />
        */}
      </Slate>
    </div>
  );
}

export default SlateEditor;
