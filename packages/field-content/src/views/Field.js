/** @jsx jsx */
import { Component } from 'react';
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import Editor from './editor';
import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import { inputStyles } from '@arch-ui/input';

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

let ContentField = ({ field, value, onChange, autoFocus, errors, isDisabled }) => {
  const htmlID = `ks-content-editor-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <ErrorBoundary>
        {Object.values(field.getBlocks())
          .filter(({ Provider, options }) => Provider && options)
          .reduce(
            (children, { Provider, options }, index) => (
              // Using index within key is ok here as the blocks never change
              // across renders
              <Provider value={options} key={`${htmlID}-provider-${index}`}>
                {children}
              </Provider>
            ),
            <Editor
              key={htmlID}
              blocks={field.getBlocks()}
              value={value}
              onChange={onChange}
              autoFocus={autoFocus}
              id={htmlID}
              css={{
                ...inputStyles({ isMultiline: true }),
                padding: '0',
              }}
              isDisabled={isDisabled}
            />
          )}
      </ErrorBoundary>
    </FieldContainer>
  );
};

export default ContentField;
