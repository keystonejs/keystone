import React, { useEffect, useRef } from 'react';
import { Global, css } from '@emotion/core';
import PropTypes from 'prop-types';
import tinymce from 'tinymce/tinymce';

// Tell TinyMCE where its assets are
tinymce.baseURL = '/tinymce-assets';

const defaultOptions = {
  autoresize_bottom_margin: 20,
  branding: false,
  menubar: false,
  statusbar: false,
  quickbars_selection_toolbar:
    'bold italic underline strikethrough | h1 h2 h3 | quicklink blockquote removeformat',
  quickbars_insert_toolbar: false,
};

const defaultPlugins =
  'link lists code autoresize paste textcolor quickbars hr table emoticons image';

const defaultToolbar =
  'formatselect forecolor | alignleft aligncenter alignright alignjustify | bullist numlist indent outdent | link unlink | image table emoticons hr | code';

// The GlobalStyles component overrides some of the TinyMCE theme
// to better match the Admin UI style
const GlobalStyles = () => (
  <Global
    styles={css`
      .tox-tinymce {
        border-radius: 5px !important;
        border-color: #c1c7d0 !important;
      }
    `}
  />
);

const Editor = props => {
  const { value, id, name, isDisabled, autoFocus, plugins, toolbar } = props;

  const elementRef = useRef(null);
  const editorRef = useRef(null);
  const contentRef = useRef(value);

  const editorIsReady = () => editorRef.current && editorRef.current.initialized;

  const handleChange = () => {
    const { onChange } = props;
    const content = editorRef.current.getContent();
    if (contentRef.current === content) return;
    contentRef.current = content;
    if (typeof onChange === 'function') {
      onChange(content);
    }
  };

  // Set up the Editor
  useEffect(() => {
    // TODO: allow additional options to be mixed in
    const options = {
      ...defaultOptions,
      auto_focus: autoFocus,
      plugins: plugins || defaultPlugins,
      readonly: isDisabled,
      target: elementRef.current,
      toolbar: toolbar || defaultToolbar,
      setup: editor => {
        editorRef.current = editor;
        editor.on('init', () => {
          if (typeof value === 'string') {
            editor.setContent(value);
          }
          editor.on('change keyup setcontent', handleChange);
        });
      },
    };
    tinymce.init(options);

    return () => {
      tinymce.remove(editorRef.current);
    };
  }, [plugins, toolbar]);

  // Update the Editor content when the value prop changes
  useEffect(() => {
    if (!editorIsReady() || typeof value !== 'string' || value === contentRef.current) return;
    editorRef.current.setContent(value);
  }, [value]);

  // Update the Editor mode when the isDisabled prop changes
  useEffect(() => {
    if (!editorIsReady()) return;
    editorRef.current.setMode(isDisabled ? 'readonly' : 'design');
  }, [isDisabled, editorRef.current]);

  return (
    <>
      <GlobalStyles />
      <textarea ref={elementRef} id={id} style={{ visibility: 'hidden', width: '100%' }} name={name} />
    </>
  );
};

Editor.propTypes = {
  autoFocus: PropTypes.bool,
  isDisabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  plugins: PropTypes.array,
  toolbar: PropTypes.array,
  value: PropTypes.string,
};

export default Editor;
