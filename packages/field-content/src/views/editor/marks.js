/** @jsx jsx */
import { jsx } from '@emotion/core';

import isHotkey from 'is-hotkey';

export const marks = {
  bold: {
    label: 'Bold',
    test: isHotkey('mod+b'),
    icon: props => (
      <strong {...props} aria-hidden>
        B
      </strong>
    ),
    render: content => <strong>{content}</strong>,
  },
  italic: {
    label: 'Italic',
    test: isHotkey('mod+i'),
    icon: props => (
      <em {...props} aria-hidden>
        I
      </em>
    ),
    render: content => <em>{content}</em>,
  },
  underline: {
    label: 'Underline',
    test: isHotkey('mod+u'),
    icon: props => (
      <u {...props} aria-hidden>
        U
      </u>
    ),
    render: content => <u>{content}</u>,
  },
  strikethrough: {
    label: 'Strikethrough',
    test: isHotkey('mod+~'),
    icon: props => (
      <s {...props} aria-hidden>
        S
      </s>
    ),
    render: content => <s>{content}</s>,
  },
};

export const markTypes = Object.keys(marks);
export const markArray = Object.entries(marks);
