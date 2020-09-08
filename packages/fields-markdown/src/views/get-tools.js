// based on https://github.com/SquidDev/MirrorMark/blob/master/src/js/mirrormark.js
import React from 'react';
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  FileMediaIcon,
} from '@primer/octicons-react';

export let getTools = cm => {
  function toggleBefore(insertion) {
    let doc = cm.getDoc();
    let cursor = doc.getCursor();

    if (doc.somethingSelected()) {
      let selections = doc.listSelections();
      let remove = null;
      cm.operation(function () {
        selections.forEach(function (selection) {
          let pos = [selection.head.line, selection.anchor.line].sort();

          // Remove if the first text starts with it
          if (remove == null) {
            remove = doc.getLine(pos[0]).startsWith(insertion);
          }

          for (let i = pos[0]; i <= pos[1]; i++) {
            if (remove) {
              // Don't remove if we don't start with it
              if (doc.getLine(i).startsWith(insertion)) {
                doc.replaceRange('', { line: i, ch: 0 }, { line: i, ch: insertion.length });
              }
            } else {
              doc.replaceRange(insertion, { line: i, ch: 0 });
            }
          }
        });
      });
    } else {
      let line = cursor.line;
      if (doc.getLine(line).startsWith(insertion)) {
        doc.replaceRange('', { line: line, ch: 0 }, { line: line, ch: insertion.length });
      } else {
        doc.replaceRange(insertion, { line: line, ch: 0 });
      }
    }
  }

  function toggleAround(start, end) {
    let doc = cm.getDoc();
    let cursor = doc.getCursor();

    if (doc.somethingSelected()) {
      let selection = doc.getSelection();
      if (selection.startsWith(start) && selection.endsWith(end)) {
        doc.replaceSelection(
          selection.substring(start.length, selection.length - end.length),
          'around'
        );
      } else {
        doc.replaceSelection(start + selection + end, 'around');
      }
    } else {
      // If no selection then insert start and end args and set cursor position between the two.
      doc.replaceRange(start + end, { line: cursor.line, ch: cursor.ch });
      doc.setCursor({ line: cursor.line, ch: cursor.ch + start.length });
    }
  }

  let tools = [
    {
      icon: BoldIcon,
      label: 'Bold',
      action() {
        cm.focus();
        toggleAround('**', '**');
      },
    },
    {
      icon: ItalicIcon,
      label: 'Italicize',
      action() {
        cm.focus();
        toggleAround('*', '*');
      },
    },
    {
      icon: QuoteIcon,
      label: 'Blockquote',
      action() {
        cm.focus();
        toggleBefore('> ');
      },
    },
    {
      label: 'Strikethrough',
      icon: () => <s aria-hidden>S</s>,
      action() {
        cm.focus();
        toggleAround('~~', '~~');
      },
    },
    {
      icon: LinkIcon,
      label: 'Link',
      action() {
        cm.focus();
        toggleAround('[', '](http://)');
      },
    },
    {
      label: 'Image',
      icon: FileMediaIcon,
      action() {
        cm.focus();
        toggleAround('![', '](http://)');
      },
    },
    {
      icon: ListUnorderedIcon,
      label: 'Unordered List',
      action() {
        cm.focus();
        toggleBefore('* ');
      },
    },
    {
      icon: ListOrderedIcon,
      label: 'Ordered List',
      action() {
        cm.focus();
        toggleBefore('1. ');
      },
    },
  ];
  return tools;
};
