/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { marks, markTypes } from './marks';
import { ToolbarButton } from './toolbar-components';
import { CircleSlashIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

function Toolbar({ blocks, editor, editorState }) {
  return (
    <div
      css={{
        display: 'flex',
        borderBottom: `2px solid ${colors.N10}`,
        marginBottom: `0.6em`,
      }}
    >
      {Object.keys(blocks)
        .map(x => blocks[x].withChrome && blocks[x].Toolbar)
        .filter(x => x)
        .reduce(
          (children, Toolbar) => {
            return (
              <Toolbar editor={editor} editorState={editorState}>
                {children}
              </Toolbar>
            );
          },
          <Fragment>
            {Object.keys(marks).map(name => {
              let Icon = marks[name].icon;
              return (
                <ToolbarButton
                  label={marks[name].label}
                  icon={<Icon />}
                  isActive={editorState.activeMarks.some(mark => mark.type === name)}
                  onClick={() => {
                    editor.toggleMark(name);
                    editor.focus();
                  }}
                  key={name}
                />
              );
            })}
            <ToolbarButton
              label="Remove Formatting"
              icon={<CircleSlashIcon />}
              onClick={() => {
                markTypes.forEach(mark => {
                  editor.removeMark(mark);
                });
                editor.focus();
              }}
            />

            {Object.keys(blocks).map(type => {
              let ToolbarElement = blocks[type].ToolbarElement;
              if (!blocks[type].withChrome || ToolbarElement === undefined) {
                return null;
              }
              return <ToolbarElement key={type} editor={editor} editorState={editorState} />;
            })}
          </Fragment>
        )}
    </div>
  );
}

export default ({ editorState, blocks, editor }) => (
  <Toolbar blocks={blocks} editor={editor} editorState={editorState} />
);
