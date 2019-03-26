import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';

const Editor = props => {
  const { value, name, isDisabled } = props;

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
    const { autoFocus, plugins, toolbar } = props;
    // TODO: allow additional options to be mixed in
    const options = {
      auto_focus: autoFocus,
      branding: false,
      content_css: '/tinymce/skins/content/default/content.css',
      menubar: false,
      plugins: plugins,
      readonly: isDisabled,
      skin_url: '/tinymce/skins/ui/oxide',
      target: elementRef.current,
      toolbar: toolbar,
      toolbar_drawer: 'floating',
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
  }, []);

  // Update the Editor content when the value prop changes
  useEffect(() => {
    if (!editorIsReady() || typeof value !== 'string' || value === contentRef.current) return;
    editorRef.current.setContent(value);
  }, [value]);

  // Update the Editor mode when the isDisabled prop changes
  useEffect(() => {
    if (!editorIsReady()) return;
    editorRef.current.setMode(isDisabled ? 'readonly' : 'design');
  }, [isDisabled]);

  return <textarea ref={elementRef} style={{ visibility: 'hidden' }} name={name} />;
};

Editor.propTypes = {
  autoFocus: PropTypes.bool,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  plugins: PropTypes.array,
  toolbar: PropTypes.array,
  value: PropTypes.string,
};

export default Editor;
