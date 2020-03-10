/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useMemo, useCallback } from 'react';

import { createEditor, Editor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
//import { withHistory } from 'slate-history';
//console.log(Editor);
//import { Editor } from 'slate-react';
//import { Block } from 'slate';
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

function Stories({ value: editorState, onChange, blocks, className, id }) {
  /*
  let schema = useMemo(() => {
    return getSchema(blocks);
  }, [blocks]);
*/
  console.log(blocks);
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
  console.log('plugins', plugins);
  const editor = useMemo(() => withReact(createEditor()), []);
  //let [editor, setEditor] = useStateWithEqualityCheck(null);

  const [value, setValue] = useState(editorState);

  const handleChange = value => {
    setValue(value);

    const content = JSON.stringify(value);
    localStorage.setItem('content', content);

    //console.log(`local parsed content`);
    //console.log(JSON.parse(content));

    onChange(content);
  };

  const onKeyDown = event => {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();

    switch (event.key) {
      case '`': {
        const [match] = Editor.nodes(editor, {
          match: n => n.type === 'code',
        });
        Transforms.setNodes(
          editor,
          { type: match ? null : 'code' },
          { match: n => Editor.isBlock(editor, n) }
        );
        break
      }

      case 'b': {
        Editor.addMark(editor, { bold: true }, true);
        Transforms.setNodes(
          editor,
          { bold: true },
          { match: n => Text.isText(n), split: true }
        );
        break
      }

      case 'u': {
        Transforms.setNodes(
          editor,
          { underline: true },
          { match: n => Text.isText(n), split: true }
        );
        break
      }
    }
  };

  // TODO: pull from marks list
  const renderLeaf = useCallback(
    ({ attributes, children, leaf: { bold, italic, underline, strike } }) => {
      const lineStyles = `
        ${underline ? 'underline' : ''}
        ${strike ? 'line-through' : ''}
      `;

      return (
        <span
          {...attributes}
          style={{
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            textDecorationLine: lineStyles,
          }}
        >
          {children}
        </span>
      );
    },
    []
  );

  return (
    <div className={className} css={{ position: 'relative' }} id={id}>
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Editable renderLeaf={renderLeaf} onKeyDown={onKeyDown} />
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
