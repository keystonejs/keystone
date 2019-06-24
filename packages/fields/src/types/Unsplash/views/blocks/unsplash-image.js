/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, createContext, useContext } from 'react';
import { Button } from '@arch-ui/button';
import pluralize from 'pluralize';

export let type = 'unsplashImage';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

let Context = createContext(null);

export let Provider = Context.Provider;

let Block = ({ unsplashId, unsplashData, onChange, onRemove }) => {
  let [currentValue, setCurrentValue] = useState(unsplashId);
  let options = useContext(Context);

  let unsplash = null;

  if (unsplashData) {
    const { source, medium } = options.attribution;
    const { publicUrl, description, user } = unsplashData;

    const imgUrl = new URL(publicUrl);
    const userUrl = new URL(user.url);
    const unsplashUrl = new URL('https://unsplash.com');

    // Adding source attribution to the URL for Unsplash to track usage
    // https://help.unsplash.com/articles/2511315-guideline-attribution
    if (source) {
      imgUrl.searchParams.set('utm_source', source);
      userUrl.searchParams.set('utm_source', source);
      unsplashUrl.searchParams.set('utm_source', source);
      if (medium) {
        imgUrl.searchParams.set('utm_medium', medium);
        userUrl.searchParams.set('utm_medium', medium);
        unsplashUrl.searchParams.set('utm_medium', medium);
      }
    }

    unsplash = (
      <div>
        <img css={{ maxWidth: '100%' }} src={imgUrl} alt={description} />
        <em>
          Photo by <a href={userUrl}>{user.name}</a> on <a href={unsplashUrl}>Unsplash</a>
        </em>
      </div>
    );
  }

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
            type="text"
            placeholder="Enter an Unsplash Image ID and press enter"
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
      {unsplash}
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
      Unsplash
    </button>
  );
}
export function Node({ node, editor }) {
  return (
    <Block
      unsplashId={node.data.get('unsplashId')}
      unsplashData={node.data.get('unsplashData')}
      onRemove={() => {
        editor.removeNodeByKey(node.key);
      }}
      onChange={unsplashId => {
        editor.setNodeByKey(node.key, {
          data: node.data.set('unsplashId', unsplashId),
        });
      }}
    />
  );
}

export let schema = {
  isVoid: true,
};

export function serialize({ node }) {
  const unsplashId = node.data.get('unsplashId');

  return {
    mutations: {
      create: {
        image: unsplashId,
      },
    },
    node: {
      ...node.toJSON(),
      // Zero out the data so we don't unnecesarily duplicate the url
      data: {},
    },
  };
}

export function deserialize({ node, joins }) {
  if (!joins || !joins.length) {
    console.error('No unsplash data received when rehydrating unsplashImage block');
    return;
  }

  // Inject the original url back into the block
  return node.set(
    'data',
    node.data.set('unsplashId', joins[0].image.unsplashId).set('unsplashData', joins[0].image)
  );
}
