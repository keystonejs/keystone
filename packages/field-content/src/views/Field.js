/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, useMemo, useCallback } from 'react';

import { colors } from '@arch-ui/theme';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { ContentFieldProvider } from './editor/context';
import { markArray } from './editor/marks';
import { toggleMark } from './editor/utils';
import AddBlock from './editor/add-block';
import Toolbar from './editor/toolbar';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span css={{ color: colors.danger }}>Unable to render content</span>;
    }

    return this.props.children;
  }
}

const ContentField = ({ field, value, onChange, autoFocus, errors }) => {
  const htmlID = `ks-content-editor-${field.path}`;
  const blocks = field.getBlocks();

  const editor = useMemo(() => {
    // Compose plugins. See https://docs.slatejs.org/concepts/07-plugins
    return [
      withReact,
      withHistory,
      ...Object.values(blocks).reduce(
        (combinedBlockPlugins, { getPlugin }) =>
          getPlugin ? [...combinedBlockPlugins, getPlugin({ blocks })] : combinedBlockPlugins,
        []
      ),
    ].reduce((composition, plugin) => plugin(composition), createEditor());
  }, [blocks]);

  const renderElement = useCallback(
    props => {
      const { [props.element.type]: { Node: ElementNode } = {} } = blocks;
      if (ElementNode) {
        return <ElementNode {...props} />;
      }

      return null;
    },
    [blocks]
  );

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    return (
      <span {...attributes}>
        {markArray.reduce((res, [type, { render }]) => {
          if (leaf[type] === true) {
            res = render(res);
          }

          return res;
        }, children)}
      </span>
    );
  }, []);

  const onKeyDown = useCallback(
    event => {
      markArray.forEach(([type, { test: doesHotkeyMatch }]) => {
        if (doesHotkeyMatch(event)) {
          event.preventDefault();
          toggleMark(editor, type);
        }
      });
    },
    [editor]
  );

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput css={{ cursor: 'text', tabIndex: 0 }}>
        <ErrorBoundary>
          <div
            id={htmlID}
            css={{
              ...inputStyles({ isMultiline: true }),
              padding: 0,
              minHeight: '200px',
              position: 'relative',
            }}
          >
            <ContentFieldProvider value={{ blocks }}>
              <Slate editor={editor} value={value} onChange={onChange}>
                <Editable
                  autoFocus={autoFocus}
                  //placeholder="Enter content"
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  onKeyDown={onKeyDown}
                  style={{ minHeight: 'inherit', padding: '16px 32px' }}
                />
                <Toolbar />
                <AddBlock />
              </Slate>
            </ContentFieldProvider>
          </div>
        </ErrorBoundary>
      </FieldInput>
    </FieldContainer>
  );
};

export default ContentField;
