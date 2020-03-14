/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';

import { useSlate, useSelected } from 'slate-react';

import { LinkIcon, CheckIcon, CircleSlashIcon, LinkExternalIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';

import { ToolbarButton } from '../toolbar-components';

export const type = 'link';

export const Node = ({ element, attributes, children }) => {
  const editor = useSlate();
  const isSelected = useSelected();

  const { href } = element;

  const [aElement, setAElement] = useState(null);
  const [linkInputValue, setLinkInputValue] = useState(href);

  // this is terrible
  // but probably necessary
  // because if we just do editor.setNodeByKey in the input onChange
  // and let that change propagate the cursor position breaks
  useEffect(() => {
    setLinkInputValue(href);
  }, [href]);

  // TODO: get editing working
  return (
    <>
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
    </>
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

const SetLinkRange = React.createContext(() => {});

const LinkMenu = props => {
  const [value, setValue] = useState('');
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

export function Toolbar({ children }) {
  const editor = useSlate();
  const [linkRange, setLinkRange] = useState(null);

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

export const ToolbarElement = () => {
  const editor = useSlate();

  //const hasLinks = editorState.inlines.some(inline => inline.type === type);
  const hasLinks = true;
  const setLinkRange = useContext(SetLinkRange);

  return (
    <ToolbarButton
      isActive={hasLinks}
      label={hasLinks ? 'Remove Link' : 'Link'}
      icon={<LinkIcon />}
      onClick={() => {
        if (hasLinks) {
          editor.unwrapInline(type);
        } else {
          setLinkRange(editor.selection);
        }
      }}
    />
  );
}

export const getPluginsNew = () => [
  editor => {
    const { isInline } = editor;

    editor.isInline = element => {
      return element.type === type ? true : isInline(element);
    };

    return editor;
  },
];
