/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState } from 'react';
import TooltipTrigger from 'react-popper-tooltip';
import { LinkIcon, CheckIcon, CircleSlashIcon } from '@arch-ui/icons';
import { ToolbarButton } from '../toolbar-components';

export let type = 'link';

export function Node({ node, attributes, children }) {
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
      css={{ display: 'flex' }}
    >
      <input
        autoFocus
        placeholder="Link..."
        css={{ border: 0, outline: 'none', background: 'transparent', color: 'white' }}
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
      <ToolbarButton label="Submit" icon={<CheckIcon />} type="submit" />
      <ToolbarButton
        label="Cancel"
        icon={<CircleSlashIcon />}
        onClick={() => {
          props.onCancel();
        }}
      />
    </form>
  );
};

export function Toolbar({ children, editor }) {
  let [linkRange, setLinkRange] = useState(null);

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
            editor.deselect();
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
      label={hasLinks ? 'Remove Link' : 'Link'}
      icon={<LinkIcon />}
      onClick={() => {
        if (hasLinks) {
          editor.unwrapInline(type);
        } else {
          setLinkRange(editorState.selection);
        }
      }}
    />
  );
}
