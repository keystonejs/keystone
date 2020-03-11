/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo, useCallback } from 'react';

import { createEditor, Editor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
console.log(Editor);
//import { Block } from 'slate';
import { markArray } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './add-block';
import { useStateWithEqualityCheck } from './hooks';
import Toolbar from './toolbar';

/*
function getSchema(blocks) {
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
    blocks: {},
  };
  Object.keys(blocks).forEach(type => {
    if (typeof blocks[type].getSchema === 'function') {
      schema.blocks[type] = blocks[type].getSchema({ blocks });
    }
  });
  return schema;
}*/

function Stories({ value: editorState, onChange, blocks, className, id }) {
  /*
  let schema = useMemo(() => {
    return getSchema(blocks);
  }, [blocks]);
*/
  //console.log(blocks);
  /*()
  const plugins = useMemo(() => {
    const renderNode = props => {
      let block = blocks[props.node.type];
      if (block) {
        return <block.Node {...props} blocks={blocks} />;
      }
      return null;
    };
    return Object.values(blocks).reduce(
      (combinedPlugins, block) => {
        if (typeof block.getPlugins !== 'function') {
          return combinedPlugins;
        }
        return [...combinedPlugins, ...block.getPlugins({ blocks })];
      },
      [
        ...markPlugins,
        {
          renderBlock: renderNode,
          renderInline: renderNode,
        },
      ]
    );
  }, [blocks]);
  */
  //console.log('plugins', plugins);

  // Compose each plugin. See https://docs.slatejs.org/concepts/07-plugins.
  const editor = useMemo(
    () =>
      [withReact, withHistory].reduce((composition, plugin) => plugin(composition), createEditor()),
    []
  );

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

          /*
        const [match] = Editor.nodes(editor, {
          at: Range,
          match: n => n[type] === true,
        });

        Transforms.setNodes(editor, { [type]: !!match }, { match: n => Text.isText(n), split: true });
        */
        }
      });
    },
    [editor]
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

  return (
    <div className={className} css={{ position: 'relative' }} id={id}>
      <Slate editor={editor} value={editorState} onChange={onChange}>
        <Editable
          placeholder="Enter text"
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          style={{ height: '100%', padding: '16px 32px' }}
        />
      </Slate>
    </div>
  );

  return (
    <div className={className} css={{ position: 'relative' }} id={id}>
      <Editor
        schema={schema}
        ref={setEditor}
        plugins={plugins}
        value={editorState}
        tabIndex={0}
        onChange={({ value }) => {
          onChange(value);
        }}
      />
      <AddBlock editor={editor} editorState={editorState} blocks={blocks} />
      <Toolbar {...{ editorState, editor, blocks }} />
    </div>
  );
}

export default Stories;
