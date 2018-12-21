/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { useEffect, Fragment, useRef, useState, useContext } from 'react';
import { embedType } from '../../constants';
import { Button } from '@voussoir/ui/src/primitives/buttons';

export let EmbedlyAPIKeyContext = React.createContext();

let Embed = ({ url }) => {
  let containerRef = useRef(null);
  let apiKey = useContext(EmbedlyAPIKeyContext);
  if (apiKey === undefined) {
    return 'Please add an Embedly API Key';
  }
  useEffect(
    () => {
      import('@iframely/embed.js').then(() => {
        window.iframely.extendOptions({ api_key: apiKey });
        window.iframely.load(containerRef.current, url);
      });
    },
    [url]
  );
  return (
    <Fragment>
      <div ref={containerRef} />
    </Fragment>
  );
};

let Block = ({ url, onChange, onRemove }) => {
  let [currentValue, setCurrentValue] = useState(url);

  return (
    <Fragment>
      <form
        onSubmit={e => {
          e.preventDefault();
          onChange(currentValue);
        }}
      >
        <div css={{ width: '100%', display: 'flex' }}>
          <input
            type="url"
            placeholder="Enter a URL and press enter to add an embed"
            css={{
              flex: 10,
              display: 'inline',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 18,
            }}
            onClick={e => {
              e.stopPropagation();
            }}
            value={currentValue}
            onChange={e => {
              setCurrentValue(e.target.value);
            }}
          />
          <div
            css={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 8,
            }}
          >
            <Button appearance="danger" onClick={onRemove} type="button">
              Remove
            </Button>
          </div>
        </div>
      </form>
      {url && <Embed url={url} />}
    </Fragment>
  );
};

export function Sidebar({ editorRef }) {
  return (
    <button
      type="button"
      onClick={() => {
        editorRef.current.insertBlock({ type: embedType });
      }}
    >
      Embed
    </button>
  );
}
export function renderNode(props, editor) {
  return (
    <Block
      url={props.node.data.get('url')}
      onRemove={() => {
        editor.removeNodeByKey(props.node.key);
      }}
      onChange={url => {
        editor.setNodeByKey(props.node.key, {
          data: { url },
        });
      }}
    />
  );
}
