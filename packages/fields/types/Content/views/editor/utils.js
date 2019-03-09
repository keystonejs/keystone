import { getVisibleSelectionRect } from 'get-selection-range';

export let hasBlock = (editorState, type) => {
  return editorState.blocks.some(node => node.type === type);
};

export let hasAncestorBlock = (editorState, type) => {
  return editorState.blocks.some(block => {
    return editorState.document.getClosest(block.key, parent => parent.type === type);
  });
};

let lastRect = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  hight: 0,
  width: 0,
};

function getLastVisibleSelectionRect() {
  let rect = getVisibleSelectionRect();
  if (!rect) {
    return lastRect;
  }
  lastRect = rect;
  return rect;
}

export let selectionReference = {
  getBoundingClientRect: () => {
    return getLastVisibleSelectionRect();
  },
  get clientWidth() {
    return selectionReference.getBoundingClientRect().width;
  },
  get clientHeight() {
    return selectionReference.getBoundingClientRect().height;
  },
};
