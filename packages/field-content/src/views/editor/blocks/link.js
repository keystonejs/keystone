/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';

import { Transforms, Range } from 'slate';
import { useSlate, useSelected } from 'slate-react';

import { LinkIcon, CheckIcon, CircleSlashIcon, LinkExternalIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';

import { ToolbarButton } from '../toolbar-components';
import { isBlockActive } from '../utils';

import isUrl from 'is-url';

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
};

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

const LinkMenu = ({ onSubmit, onCancel }) => {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={e => {
        e.stopPropagation();
        e.preventDefault();
        onSubmit(value);
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
      <ToolbarButton label="Cancel" icon={<CircleSlashIcon />} onClick={onCancel} />
    </form>
  );
};

export const Toolbar = ({ children }) => {
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

  const hasLinks = isBlockActive(editor, type);
  const setLinkRange = useContext(SetLinkRange);

  return (
    <ToolbarButton
      isActive={hasLinks}
      label={hasLinks ? 'Remove Link' : 'Link'}
      icon={<LinkIcon />}
      onClick={() => {
        if (hasLinks) {
          Transforms.unwrapNodes(editor, { match: n => n.type === type });
        } else {
          setLinkRange(editor.selection);
        }
      }}
    />
  );
};

const wrapLink = (editor, url) => {
  if (isBlockActive(editor, type)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type,
    href: url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const getPlugin = () => [
  editor => {
    const { isInline, insertText, insertData } = editor;

    editor.isInline = element => {
      return element.type === type ? true : isInline(element);
    };

    editor.insertText = text => {
      if (text && isUrl(text)) {
        wrapLink(editor, text);
      } else {
        insertText(text);
      }
    };

    editor.insertData = data => {
      const text = data.getData('text/plain');

      if (text && isUrl(text)) {
        wrapLink(editor, text);
      } else {
        insertData(data);
      }
    };

    return editor;
  },
];
