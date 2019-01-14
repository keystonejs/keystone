import { getVisibleSelectionRect } from 'get-selection-range';

export let hasBlock = (editorState, type) => {
  return editorState.blocks.some(node => node.type === type);
};

export let hasAncestorBlock = (editorState, type) => {
  return editorState.blocks.some(block => {
    return editorState.document.getClosest(block.key, parent => parent.type === type);
  });
};

export let selectionReference = {
  getBoundingClientRect: () => {
    let rect = getVisibleSelectionRect();
    if (!rect) {
      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        hight: 0,
        width: 0,
      };
    }
    return rect;
  },
  get clientWidth() {
    return selectionReference.getBoundingClientRect().width;
  },
  get clientHeight() {
    return selectionReference.getBoundingClientRect().height;
  },
};
