/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, useMemo } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './AddBlock';
import { useStateWithEqualityCheck } from './hooks';
import Toolbar from './toolbar';

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
    if (blocks[type].schema !== undefined) {
      schema.blocks[type] = blocks[type].schema;
    }
  });
  return schema;
}

function Stories({ value: editorState, onChange, blocks, className }) {
  let schema = useMemo(
    () => {
      return getSchema(blocks);
    },
    [blocks]
  );

  let plugins = useMemo(
    () => {
      let combinedPlugins = [
        ...markPlugins,
        {
          renderNode(props) {
            let block = blocks[props.node.type];
            if (block) {
              return <block.Node {...props} />;
            }
            return null;
          },
        },
      ];

      Object.keys(blocks).forEach(type => {
        let blockTypePlugins = blocks[type].plugins;
        if (blockTypePlugins !== undefined) {
          combinedPlugins.push(...blockTypePlugins);
        }
      });
      return combinedPlugins;
    },
    [blocks]
  );

  let [editor, setEditor] = useStateWithEqualityCheck(null);
  let containerRef = useRef(null);
  return (
    <div ref={containerRef} className={className}>
      <Editor
        schema={schema}
        ref={setEditor}
        plugins={plugins}
        value={editorState}
        onChange={({ value }) => {
          onChange(value);
        }}
      />
      <AddBlock editor={editor} editorState={editorState} blocks={blocks} />
      <Toolbar {...{ editorState, editor, blocks, containerRef }} />
    </div>
  );
}

export default Stories;
