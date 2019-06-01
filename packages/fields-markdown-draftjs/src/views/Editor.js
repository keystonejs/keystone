/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import compose from 'compose-function';
import PluginEditor from 'draft-js-plugins-editor';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

const encodeEditorState = compose(EditorState.createWithContent, convertFromRaw, mdToDraftjs);
const decodeEditorState = compose(draftjsToMd, convertToRaw, v => v.getCurrentContent());

const Editor = ({ value, id, name, isDisabled, autoFocus, onChange }) => {
  const plugins = useMemo(() => [
    createMarkdownShortcutsPlugin(),
  ], []);
  const [ editorState, onEditorState ] = useState(encodeEditorState(value));
  const ref = useRef();
  useEffect(() => {
    onEditorState(encodeEditorState(value));
    if (ref.current && autoFocus) {
      ref.current.focus();
    }
  }, []);
  useEffect(() => onChange(decodeEditorState(editorState)), [ value ]);
  
  return (
    <div css={css`
      width: 100%;
      padding: 8px;
      border: 1px solid #c1c7d0;
      border-radius: 5px;
    `}>
      <PluginEditor
        ref={ref}
        id={id}
        name={name}
        editorState={editorState}
        onChange={isDisabled ? undefined : onEditorState}
        plugins={plugins}
      />
    </div>
  );
}

Editor.propTypes = {
  autoFocus: PropTypes.bool,
  isDisabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default Editor;
