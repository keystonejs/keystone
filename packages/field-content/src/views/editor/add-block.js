/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { PlusIcon } from '@arch-ui/icons';
import { type as defaultType } from './blocks/paragraph';

import { Editor } from 'slate';
import { useSlate } from 'slate-react';

const getSelectedElement = () => {
  if (document.selection) {
    return document.selection.createRange().parentElement();
  }

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0).startContainer.parentNode;
  }
};

const AddBlock = ({ blocks }) => {
  const editor = useSlate();
  const { selection } = editor;

  const [isOpen, setIsOpen] = useState(true);

  const iconRef = useRef(null);
  const menuRef = useRef(null);

  const layout = useCallback(() => {
    const iconEle = iconRef.current;
    const menuEle = menuRef.current;
    const elm = getSelectedElement();

    if (
      selection === null ||
      Editor.string(editor, selection) !== '' /*|| node.type !== defaultType*/
    ) {
      iconEle.style.top = `-9999px`;
      iconEle.style.left = `-9999px`;
      menuEle.style.top = `-9999px`;
      menuEle.style.left = `-9999px`;

      if (isOpen) {
        setIsOpen(false);
      }

      return;
    }

    if (!blocks || !blocks.length) return;

    if (elm && editor && editor.el.contains(elm)) {
      iconEle.style.top = `${elm.offsetTop + elm.offsetHeight / 2}px`;
      iconEle.style.left = 0;
      menuEle.style.top = `${elm.offsetTop - elm.offsetHeight / 2}px`;
      menuEle.style.left = `42px`;
    } else {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  }, [selection, iconRef.current, menuRef.current]);

  useLayoutEffect(layout);

  return (
    <Fragment>
      <div
        css={{
          position: 'absolute',
          zIndex: 10,
          transform: 'translate(0, -50%)',
          top: -99999,
          left: -9999,
        }}
        ref={iconRef}
      >
        <button
          type="button"
          css={{
            border: 'none',
            background: '#efefef',
            color: '#aaa',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
            ':hover': {
              color: '#888',
            },
          }}
          onClick={() => {
            setIsOpen(x => !x);
          }}
          title="Add block"
        >
          <PlusIcon
            css={{
              transition: '50ms transform',
              transform: isOpen ? 'rotateZ(45deg)' : 'rotateZ(0deg)',
            }}
            title={isOpen ? 'Close' : 'Open'}
          />
        </button>
      </div>
      <div ref={menuRef} css={{ position: 'absolute', zIndex: 10, top: -99999, left: -9999 }}>
        {isOpen && (
          <ul
            css={{
              background: 'white',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              border: 'solid 1px #eaeaea',
            }}
          >
            <li
              css={{
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center',
              }}
            >
              <strong
                css={{
                  textTransform: 'uppercase',
                  color: '#999',
                  fontSize: '.8rem',
                  padding: '5px 15px',
                }}
              >
                Insert Block
              </strong>
            </li>
            {Object.entries(blocks).map(([type, { withChrome, Sidebar }]) => {
              if (withChrome && Sidebar) {
                return (
                  <li
                    key={`sidebar-${type}`}
                    css={{
                      display: 'flex',
                      justifyContent: 'left',
                      alignItems: 'center',
                    }}
                  >
                    <Sidebar key={type} blocks={blocks} />
                  </li>
                );
              }

              return null;
            })}
          </ul>
        )}
      </div>
    </Fragment>
  );
};

export default AddBlock;
