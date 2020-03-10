/** @jsx jsx */
import { jsx } from '@emotion/core';

import isHotkey from 'is-hotkey';

function markPlugin(type, options) {
  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if (!options.test(event)) return next();
      // Prevent the default characters from being inserted.
      event.preventDefault();
      // Toggle the mark `type`.
      editor.toggleMark(type);
    },
    renderMark: (props, editor, next) => {
      if (props.mark.type === type) {
        return options.render(props);
      }
      return next();
    },
  };
}

export const marks = {
  bold: {
    hotkey: 'mod+b',
    test: isHotkey('mod+b'),
    label: 'Bold',

    icon: props => {
      return (
        <strong {...props} aria-hidden>
          B
        </strong>
      );
    },
    render: props => <strong {...props.attributes}>{props.children}</strong>,
  },
  italic: {
    hotkey: 'mod+i',
    test: isHotkey('mod+i'),
    label: 'Italic',
    icon: props => {
      return (
        <em {...props} aria-hidden>
          I
        </em>
      );
    },
    render: props => <em {...props.attributes}>{props.children}</em>,
  },
  strikethrough: {
    hotkey: 'mod+~',
    test: isHotkey('mod+~'),
    label: 'Strikethrough',
    icon: props => {
      return (
        <s {...props} aria-hidden>
          S
        </s>
      );
    },
    render: props => <s {...props.attributes}>{props.children}</s>,
  },
  underline: {
    hotkey: 'mod+u',
    test: isHotkey('mod+u'),
    label: 'Underline',
    icon: props => {
      return (
        <u {...props} aria-hidden>
          U
        </u>
      );
    },
    render: props => <u {...props.attributes}>{props.children}</u>,
  },
};

export const markHotkeys = Object.entries(marks).reduce((result, [mark, { hotkey }]) => {
  result[hotkey] = mark;
  return result;
}, {});

export const markTypes = Object.keys(marks);

export const plugins = Object.entries(marks).map(([type, options]) => {
  return markPlugin(type, options);
});
