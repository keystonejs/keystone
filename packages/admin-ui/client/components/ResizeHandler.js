import { Component } from 'react';
import raf from 'raf-schd';

const LS_KEY = 'KEYSTONE_NAVIGATION_STATE';
const DEFAULT_STATE = { width: 240 };

function getCache() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STATE;
  }
  return DEFAULT_STATE;
}
function setCache(state) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
}

export default class ResizeHandler extends Component {
  state = getCache();

  storeState = state => {
    // only store the width property in locals storage
    if (state.width) setCache({ width: state.width });

    this.setState(state);
  };

  handleResizeStart = (event: MouseEvent) => {
    // bail if not "left click"
    if (event.button && event.button > 0) return;

    // avoid text selection and hover styles
    document.body.style.pointerEvents = 'none';

    // initialize resize gesture
    this.storeState({ initialX: event.pageX, mouseIsDown: true });

    // attach handlers (handleResizeStart is a bound to onMouseDown)
    window.addEventListener('mousemove', this.handleResize);
    window.addEventListener('mouseup', this.handleResizeEnd);
  };

  initializeDrag = () => {
    let initialWidth = this.state.width;

    this.storeState({ initialWidth, isDragging: true });
  };

  handleResize = raf((event: MouseEvent) => {
    const { initialX, initialWidth, isDragging, mouseIsDown } = this.state;

    // on occasion a mouse move event occurs before the event listeners
    // have a chance to detach
    if (!mouseIsDown) return;

    // initialize dragging
    if (!isDragging) {
      this.initializeDrag(event);
      return;
    }

    const delta = event.pageX - initialX;
    const width = initialWidth + delta;

    this.storeState({ delta, width });
  });
  handleDoubleClick = () => {
    console.log('handleDoubleClick');
    this.storeState({ width: 20 });
  };
  handleResizeEnd = () => {
    this.storeState({ isDragging: false, mouseIsDown: false });

    document.body.style.pointerEvents = null;
    window.removeEventListener('mousemove', this.handleResize);
    window.removeEventListener('mouseup', this.handleResizeEnd);
  };

  render() {
    const handlers = {
      title: 'Drag to Resize. Double Click to Collapse.',
      onMouseDown: this.handleResizeStart,
      onDoubleClick: this.handleDoubleClick,
    };

    return this.props.children(handlers, this.state);
  }
}
