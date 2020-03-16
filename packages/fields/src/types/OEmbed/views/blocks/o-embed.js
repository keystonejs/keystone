/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Suspense, Fragment, useState, createContext, useContext } from 'react';
import { Transforms } from 'slate';
import { useSlate } from 'slate-react';

import { BlockMenuItem } from '@keystonejs/field-content/block-components';

import { Button } from '@arch-ui/button';
import PreviewPlaceholder from '../preview';
import pluralize from 'pluralize';

export const type = 'oEmbed';

// TODO: Receive this value from the server somehow. 'pluralize' is a fairly
// large lib.
export const path = pluralize.plural(type);

const Context = createContext(null);

export const Provider = Context.Provider;

const Embed = ({ url, oembedData }) => {
  const options = useContext(Context);

  if (options.previewComponent) {
    // The adapter should implement this option
    const [Preview] = options.adminMeta.readViews([options.previewComponent]);
    return <Preview url={url} options={options} />;
  } else {
    // This is a fallback so we can at least try to render _something_
    return <PreviewPlaceholder data={oembedData} originalUrl={url} />;
  }
};

const Block = ({ url, oembedData, onChange, onRemove }) => {
  const [currentValue, setCurrentValue] = useState(url);

  const embed = null;

  if (url) {
    embed = (
      <Suspense fallback={<div>Generating Preview...</div>}>
        <Embed url={url} oembedData={oembedData} />
      </Suspense>
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
      {embed}
    </Fragment>
  );
};

export const Sidebar = () => {
  const editor = useSlate();

  const icon = (
    <svg
      width={16}
      height={16}
      ariaHidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
    >
      <path d="M320,32a32,32,0,0,0-64,0v96h64Zm48,128H16A16,16,0,0,0,0,176v32a16,16,0,0,0,16,16H32v32A160.07,160.07,0,0,0,160,412.8V512h64V412.8A160.07,160.07,0,0,0,352,256V224h16a16,16,0,0,0,16-16V176A16,16,0,0,0,368,160ZM128,32a32,32,0,0,0-64,0v96h64Z" />
    </svg>
  );

  return (
    <BlockMenuItem
      icon={icon}
      text="Embed"
      insertBlock={() => {
        editor.insertBlock({ type });
      }}
    />
  );
};

export const Node = ({ element: { url, oembedData } }) => {
  const editor = useSlate();

  return (
    <Block
      url={url}
      oembedData={oembedData}
      onRemove={() => Transforms.removeNodes(editor)}
      onChange={url => Transforms.setNodes(editor, { url })}
    />
  );
};

export const getPlugin = () => [
  editor => {
    const { isVoid } = editor;

    editor.isVoid = element => {
      return element.type === type ? true : isVoid(element);
    };

    return editor;
  },
];

export const serialize = ({ node: { url, _joinIds: joinIds } }) => {
  const mutations =
    joinIds && joinIds.length
      ? {
          connect: { id: joinIds[0] },
        }
      : {
          create: {
            embed: url,
          },
        };

  return {
    mutations,
    node: {
      ...node.toJSON(),
      // Zero out the data so we don't unnecesarily duplicate the url
      data: {},
    },
  };
};

export const deserialize = ({ node, joins }) => {
  if (!joins || !Array.isArray(joins) || joins.length === 0 || !joins[0].embed) {
    console.error('No embed data received when rehydrating oEmbed block');
    return;
  }

  // Inject the original url back into the block
  return node.set(
    'data',
    node.data.set('url', joins[0].embed.originalUrl).set('oembedData', joins[0].embed)
  );
};
