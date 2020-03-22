/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { PlusIcon } from '@arch-ui/icons';
import { type as defaultType } from './blocks/paragraph';

import { Editor, Node } from 'slate';
import { useSlate } from 'slate-react';
import { useContentField } from './context';

const getSelectedElement = () => {
  if (document.selection) {
    return document.selection.createRange().parentElement();
  }

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0).startContainer.parentNode;
  }
};

const AddBlock = () => {
  const editor = useSlate();

  const [focusNode] = Editor.nodes(editor, { match: n => Editor.isBlock(editor, n) });

  const { blocks } = useContentField();

  const [isOpen, setIsOpen] = useState(true);

  const iconRef = useRef(null);
  const menuRef = useRef(null);

  const layout = useCallback(() => {
    const iconEle = iconRef.current;
    const menuEle = menuRef.current;

    const elm = getSelectedElement();

    if (!focusNode || Node.string(focusNode[0]) !== '' || focusNode[0].type !== defaultType) {
      iconEle.style.top = `-9999px`;
      iconEle.style.left = `-9999px`;
      menuEle.style.top = `-9999px`;
      menuEle.style.left = `-9999px`;

      if (isOpen) {
        setIsOpen(false);
      }

      return;
    }

    if (!blocks) return;

    if (elm && editor /*&& editor.el.contains(elm)*/) {
      iconEle.style.top = `${elm.offsetTop + elm.offsetHeight / 2}px`;
      iconEle.style.left = 0;
      menuEle.style.top = `${elm.offsetTop - elm.offsetHeight / 2}px`;
      menuEle.style.left = `42px`;
    } else {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  }, [focusNode, iconRef.current, menuRef.current]);

  useLayoutEffect(layout);

  return (
    <Fragment>
      <div
        ref={iconRef}
        css={{
          position: 'absolute',
          zIndex: 10,
          transform: 'translate(0, -50%)',
          top: -99999,
          left: -9999,
        }}
      >
        <button
          title="Add block"
          type="button"
          onClick={() => setIsOpen(o => !o)}
          css={{
            border: 'none',
            background: '#efefef',
            color: '#aaa',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px',
            ':hover': {
              color: '#888',
            },
          }}
        >
          <PlusIcon
            title={isOpen ? 'Close' : 'Open'}
            css={{
              transition: '50ms transform',
              transform: isOpen ? 'rotateZ(45deg)' : 'rotateZ(0deg)',
            }}
          />
        </button>
      </div>
      <div
        ref={menuRef}
        css={{ position: 'absolute', zIndex: 10, top: -99999, left: -9999, margin: '4px' }}
      >
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
                    <Sidebar key={type} />
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
