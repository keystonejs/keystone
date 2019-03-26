import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';

import eventProps from './eventProps';

const isValidEvent = name => !!eventProps[name];

const isFunction = fn => typeof fn === 'function';

const bindEventProps = (props, editor, initEvent) => {
  Object.keys(props)
    .filter(isValidEvent)
    .forEach(prop => {
      const handler = props[prop];
      if (isFunction(handler)) {
        if (prop === 'onInit') {
          handler(initEvent, editor);
        } else {
          editor.on(prop.substring(2), e => handler(e, editor));
        }
      }
    });
};

export const editorPropTypes = {
  autoFocus: PropTypes.bool,
  isDisabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  plugins: PropTypes.array,
  toolbar: PropTypes.array,
  value: PropTypes.string,
  ...eventProps,
};

export default class Editor extends Component {
  static propTypes = editorPropTypes;
  element = null;
  componentDidMount() {
    const { autoFocus, plugins, toolbar, isDisabled, value } = this.props;
    // TODO: allow additional options to be mixed in
    const options = {
      auto_focus: autoFocus,
      branding: false,
      content_css: '/tinymce/skins/content/default/content.css',
      plugins: plugins,
      readonly: isDisabled,
      skin_url: '/tinymce/skins/ui/oxide',
      target: this.element,
      toolbar: toolbar,
      setup: editor => {
        this.editor = editor;
        editor.on('init', e => {
          editor.setContent(value || '');
          editor.on('change keyup setcontent', this.handleChange);
          bindEventProps(this.props, editor, e);
        });
      },
    };
    tinymce.init(options);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.editor || !this.editor.initialized) return;
    this.currentContent = this.currentContent || this.editor.getContent();
    if (
      typeof nextProps.value === 'string' &&
      nextProps.value !== this.props.value &&
      nextProps.value !== this.currentContent
    ) {
      this.editor.setContent(nextProps.value);
    }
    if (
      typeof nextProps.isDisabled === 'boolean' &&
      nextProps.isDisabled !== this.props.isDisabled
    ) {
      this.editor.setMode(nextProps.isDisabled ? 'readonly' : 'design');
    }
  }
  componentWillUnmount() {
    tinymce.remove(this.editor);
  }
  handleChange = () => {
    const content = this.editor.getContent();
    if (this.currentContent === content) return;
    this.currentContent = content;
    const { onChange } = this.props;
    if (isFunction(onChange)) {
      onChange(content);
    }
  };
  render() {
    const { name } = this.props;
    return (
      <textarea ref={el => (this.element = el)} style={{ visibility: 'hidden' }} name={name} />
    );
  }
}
