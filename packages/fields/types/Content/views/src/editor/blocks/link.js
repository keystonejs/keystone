/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState, Fragment, useEffect } from 'react';
import { LinkIcon, CheckIcon, CircleSlashIcon, LinkExternalIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { Popper } from 'react-popper';
import { createPortal } from 'react-dom';
import { ToolbarButton } from '../toolbar-components';

export let type = 'link';

export function Node({ node, attributes, children, isSelected, editor }) {
  let { data } = node;
  const href = data.get('href');
  let [aElement, setAElement] = useState(null);

  let [linkInputValue, setLinkInputValue] = useState(href);

  // this is terrible
  // but probably necessary
  // because if we just do editor.setNodeByKey in the input onChange
  // and let that change propagate the cursor position breaks
  useEffect(() => {
    setLinkInputValue(href);
  }, [href]);

  return (
    <Fragment>
      <a
        {...attributes}
        ref={setAElement}
        css={{ color: 'blue', ':visited': { color: 'purple' } }}
        href={href}
      >
        {children}
      </a>
      {isSelected &&
        createPortal(
          <Popper placement="bottom" referenceElement={aElement}>
            {({ style, ref }) => {
              return (
                <div style={style} css={{ margin: gridSize, display: 'flex' }}>
                  <div
                    ref={ref}
                    css={{
                      backgroundColor: colors.N90,
                      color: 'white',
                      padding: 8,
                      borderRadius: 6,
                      display: 'flex',
                    }}
                  >
                    <LinkInput
                      value={linkInputValue}
                      onChange={event => {
                        setLinkInputValue(event.target.value);
                        editor.setNodeByKey(node.key, {
                          data: data.set('href', event.target.value),
                        });
                      }}
                    />
                    <ToolbarButton
                      as="a"
                      tooltipPlacement="bottom"
                      icon={<LinkExternalIcon />}
                      target="_blank"
                      rel="noopener"
                      label="Open Link"
                      css={{ marginLeft: gridSize }}
                      href={href}
                    />
                  </div>
                </div>
              );
            }}
          </Popper>,
          document.body
        )}
    </Fragment>
  );
}

function LinkInput(props) {
  return (
    <input
      placeholder="Link..."
      css={{ border: 0, outline: 'none', background: 'transparent', color: 'white' }}
      {...props}
    />
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
      <LinkInput
        autoFocus
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
