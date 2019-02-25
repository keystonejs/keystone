/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, Fragment, useRef, useState, createContext, useContext } from 'react';
import { Button } from '@arch-ui/button';

export let type = 'embed';

let Context = createContext(null);

export let Provider = Context.Provider;

let Embed = ({ url }) => {
  let containerRef = useRef(null);
  let options = useContext(Context);

  useEffect(
    () => {
      import('@iframely/embed.js').then(() => {
        window.iframely.extendOptions({ api_key: options.apiKey });
        window.iframely.load(containerRef.current, url);
      });
    },
    [url]
  );

  if (!options || !options.apiKey) {
    return 'Please add an Embedly API Key';
  }

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

export function Sidebar({ editor }) {
  return (
    <button
      type="button"
      onClick={() => {
        editor.insertBlock({ type });
      }}
    >
      Embed
    </button>
  );
}
export function Node({ node, editor }) {
  return (
    <Block
      url={node.data.get('url')}
      onRemove={() => {
        editor.removeNodeByKey(node.key);
      }}
      onChange={url => {
        editor.setNodeByKey(node.key, {
          data: node.data.set('url', url),
        });
      }}
    />
  );
}

export let schema = {
  isVoid: true,
};
