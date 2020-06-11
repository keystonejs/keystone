/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { Editor } from 'slate-react';
import { Block } from 'slate';
import { plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './add-block';
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
    if (typeof blocks[type].getSchema === 'function') {
      schema.blocks[type] = blocks[type].getSchema({ blocks });
    }
  });
  return schema;
}

function Stories({ value: editorState, onChange, blocks, className, id, isDisabled }) {
  let schema = useMemo(() => {
    return getSchema(blocks);
  }, [blocks]);

  let plugins = useMemo(() => {
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

  let [editor, setEditor] = useStateWithEqualityCheck(null);

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
        readOnly={isDisabled}
        css={{
          minHeight: 200,
          padding: '16px 32px',
        }}
      />
      <AddBlock editor={editor} editorState={editorState} blocks={blocks} />
      <Toolbar {...{ editorState, editor, blocks }} />
    </div>
  );
}

export default Stories;
