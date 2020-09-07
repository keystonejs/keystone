export let hasBlock = (editorState, type) => {
  return editorState.blocks.some(node => node.type === type);
};

export let hasAncestorBlock = (editorState, type) => {
  return editorState.blocks.some(block => {
    return editorState.document.getClosest(block.key, parent => parent.type === type);
  });
};

// this has a bit of strange logic because
// we want to always make sure that we're returning
// the rect for the most recent selection
export let getSelectionReference = () => {
  // note that we store the last range
  // _not_ the rect, this means that
  // this will always return the correct rect
  // wrt scroll position or any other reason
  // for the elements moving
  let lastRange;
  let initialSelection = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    hight: 0,
    width: 0,
  };
  let getBoundingClientRect = () => {
    let selection = window.getSelection();
    let { nodeName } = selection.anchorNode;

    let range =
      !selection.rangeCount || nodeName === 'INPUT' || nodeName === 'TEXTAREA'
        ? lastRange
        : selection.getRangeAt(0);

    if (!range) {
      return initialSelection;
    }

    let newBoundingClientRect = getRangeBoundingClientRect(range);
    if (newBoundingClientRect.width === 0 && newBoundingClientRect.height === 0) {
      if (!lastRange) {
        return initialSelection;
      }

      return getRangeBoundingClientRect(lastRange);
    }

    lastRange = range;

    return newBoundingClientRect;
  };

  return {
    getBoundingClientRect,
    get clientWidth() {
      return getBoundingClientRect().width;
    },
    get clientHeight() {
      return getBoundingClientRect().height;
    },
  };
};

// from https://github.com/Canner/get-selection-range/blob/master/src/index.js

const isChrome =
  typeof window !== 'undefined' &&
  /Chrome/.test(navigator.userAgent) &&
  /Google Inc/.test(navigator.vendor);

const getRangeClientRectsChrome = range => {
  var tempRange = range.cloneRange();
  var clientRects = [];

  for (var ancestor = range.endContainer; ancestor !== null; ancestor = ancestor.parentNode) {
    var atCommonAncestor = ancestor === range.commonAncestorContainer;
    if (atCommonAncestor) {
      tempRange.setStart(range.startContainer, range.startOffset);
    } else {
      tempRange.setStart(tempRange.endContainer, 0);
    }
    var rects = Array.from(tempRange.getClientRects());
    clientRects.push(rects);
    if (atCommonAncestor) {
      clientRects.reverse();
      return [].concat(...clientRects);
    }
    tempRange.setEndBefore(ancestor);
  }

  throw new Error('Found an unexpected detached subtree when getting range client rects.');
};

const getRangeClientRects = isChrome
  ? getRangeClientRectsChrome
  : function (range) {
      return Array.from(range.getClientRects());
    };

const getRangeBoundingClientRect = range => {
  var rects = getRangeClientRects(range);
  var top = 0;
  var right = 0;
  var bottom = 0;
  var left = 0;

  if (rects.length) {
    ({ top, right, bottom, left } = rects[0]);
    for (var ii = 1; ii < rects.length; ii++) {
      var rect = rects[ii];
      if (rect.height !== 0 || rect.width !== 0) {
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
        left = Math.min(left, rect.left);
      }
    }
  }

  return {
    top,
    right,
    bottom,
    left,
    width: right - left,
    height: bottom - top,
  };
};
