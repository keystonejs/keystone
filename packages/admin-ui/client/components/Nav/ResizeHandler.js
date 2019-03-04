import { Component } from 'react';
import raf from 'raf-schd';

import { withKeyboardConsumer } from '../KeyboardShortcuts';

const LS_KEY = 'KEYSTONE_NAVIGATION_STATE';
const DEFAULT_STATE = { isCollapsed: false, width: 280 };
const MIN_WIDTH = 140;
const MAX_WIDTH = 800;
export const KEYBOARD_SHORTCUT = '[';

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

class ResizeHandler extends Component {
  state = getCache();

  componentDidMount() {
    this.props.keyManager.subscribe(KEYBOARD_SHORTCUT, this.toggleCollapse);
  }
  componentWillUnmount() {
    this.props.keyManager.unsubscribe(KEYBOARD_SHORTCUT);
  }

  storeState = s => {
    // only keep the `isCollapsed` and `width` properties in locals storage
    const isCollapsed = s.isCollapsed !== undefined ? s.isCollapsed : this.state.isCollapsed;
    const width = s.width !== undefined ? s.width : this.state.width;

    setCache({ isCollapsed, width });

    this.setState(s);
  };

  handleResizeStart = (event: MouseEvent) => {
    // bail if not "left click"
    if (event.button && event.button > 0) return;

    // initialize resize gesture
    this.setState({ initialX: event.pageX, mouseIsDown: true });

    // attach handlers (handleResizeStart is a bound to onMouseDown)
    window.addEventListener('mousemove', this.handleResize);
    window.addEventListener('mouseup', this.handleResizeEnd);
  };

  initializeDrag = () => {
    let initialWidth = this.state.width;

    this.setState({ initialWidth, isDragging: true });
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

    // allow the product nav to be 75% of the available page width
    const adjustedMax = MAX_WIDTH - initialWidth;
    const adjustedMin = MIN_WIDTH - initialWidth;

    const delta = Math.max(Math.min(event.pageX - initialX, adjustedMax), adjustedMin);
    const width = initialWidth + delta;

    this.setState({ delta, width });
  });
  handleResizeEnd = () => {
    // reset non-width states
    this.setState({ delta: 0, isDragging: false, mouseIsDown: false });

    // store the width
    this.storeState({ width: this.state.width });

    // cleanup
    window.removeEventListener('mousemove', this.handleResize);
    window.removeEventListener('mouseup', this.handleResizeEnd);
  };
  toggleCollapse = () => {
    const isCollapsed = !this.state.isCollapsed;
    this.storeState({ isCollapsed });
  };

  render() {
    const resizeProps = {
      title: 'Drag to Resize',
      onMouseDown: this.handleResizeStart,
    };
    const clickProps = {
      onClick: this.toggleCollapse,
    };
    const snapshot = this.state;

    return this.props.children(resizeProps, clickProps, snapshot);
  }
}

export default withKeyboardConsumer(ResizeHandler);
