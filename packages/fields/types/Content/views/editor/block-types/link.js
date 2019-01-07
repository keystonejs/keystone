/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState, useLayoutEffect } from 'react';
import TooltipTrigger from 'react-popper-tooltip';
import { LinkIcon } from '@voussoir/icons';
import { ToolbarButton } from '../toolbar-components';

export let type = 'link';

export function renderNode({ node, attributes, children }) {
  let { data } = node;
  const href = data.get('href');
  return (
    <TooltipTrigger
      placement="bottom"
      delayHide={200}
      tooltip={({ getTooltipProps, tooltipRef }) => (
        <div
          {...getTooltipProps({
            ref: tooltipRef,
          })}
          css={{ backgroundColor: 'black', padding: 8 }}
        >
          <a css={{ color: 'white' }} contentEditable={false} href={href}>
            {href}
          </a>
          {/* TODO: edit button */}
        </div>
      )}
    >
      {({ getTriggerProps, triggerRef }) => (
        <a
          {...getTriggerProps({ ref: triggerRef })}
          {...attributes}
          css={{ color: 'blue', ':visited': { color: 'purple' } }}
          href={href}
        >
          {children}
        </a>
      )}
    </TooltipTrigger>
  );
}

let SetLinkRange = React.createContext(() => {});

let LinkMenu = props => {
  let [value, setValue] = useState('');
  return (
    <form
      onSubmit={e => {
        e.stopPropagation();
        e.preventDefault();
        props.onSubmit(value);
      }}
    >
      <input
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
      <button type="submit">Submit</button>
      <button
        type="button"
        onClick={() => {
          props.onCancel();
        }}
      >
        Cancel
      </button>
    </form>
  );
};

export function Toolbar({ reposition, children, editor }) {
  let [linkRange, setLinkRange] = useState(null);

  useLayoutEffect(reposition, [linkRange]);

  return (
    <SetLinkRange.Provider value={setLinkRange}>
      {linkRange === null ? (
        children
      ) : (
        <LinkMenu
          onSubmit={value => {
            editor.wrapInlineAtRange(linkRange, {
              type: type,
              data: { href: value },
            });
            // idk why the setTimeout is necessary but it works so ¯\_(ツ)_/¯
            setTimeout(() => setLinkRange(null), 0);
          }}
          onCancel={() => {
            setLinkRange(null);
          }}
        />
      )}
    </SetLinkRange.Provider>
  );
}
export function ToolbarElement({ editor, editorState }) {
  let hasLinks = editorState.inlines.some(inline => inline.type === type);

  let setLinkRange = useContext(SetLinkRange);
  return (
    <ToolbarButton
      isActive={hasLinks}
      onClick={() => {
        if (hasLinks) {
          editor.unwrapInline(type);
        } else {
          setLinkRange(editorState.selection);
        }
      }}
    >
      <LinkIcon title={hasLinks ? 'Remove Link' : 'Link'} />
    </ToolbarButton>
  );
}
