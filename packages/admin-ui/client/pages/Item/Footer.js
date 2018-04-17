import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import raf from 'raf-schd';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { colors } from '@keystonejs/ui/src/theme';

const Wrapper = styled.div({
  marginTop: 60,
  position: 'relative',
});
const Toolbar = styled.div({
  backgroundColor: colors.page,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px -2px 0px',
  display: 'flex',
  justifyContent: 'space-between',
  margin: '24px 0',
  padding: '24px 0',
});

function getWindowSize() {
  return {
    x: window.innerWidth,
    y: window.innerHeight,
  };
}

export default class Footer extends Component {
  state = {
    position: 'relative',
    width: 'auto',
    height: 'auto',
    top: 0,
  };
  static propTypes = {
    onDelete: PropTypes.func,
    onReset: PropTypes.func,
    onSave: PropTypes.func,
  };
  componentDidMount() {
    // Bail in IE8 because React doesn't support the onScroll event in that browser
    // Conveniently (!) IE8 doesn't have window.getComputedStyle which we also use here
    if (!window.getComputedStyle) return;

    this.windowSize = getWindowSize();
    const footerStyle = window.getComputedStyle(this.footer);
    this.footerSize = {
      x: this.footer.offsetWidth,
      y: this.footer.offsetHeight + parseInt(footerStyle.marginTop || '0'),
    };
    window.addEventListener('scroll', this.recalcPosition, false);
    window.addEventListener('resize', this.recalcPosition, false);
    this.recalcPosition();
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.recalcPosition, false);
    window.removeEventListener('resize', this.recalcPosition, false);
  }
  recalcPosition = raf(() => {
    this.footerSize.x = this.wrapper.offsetWidth;

    var offsetTop = 0;
    var offsetEl = this.wrapper;

    while (offsetEl) {
      offsetTop += offsetEl.offsetTop;
      offsetEl = offsetEl.offsetParent;
    }

    const maxY = offsetTop + this.footerSize.y;
    const viewY = window.scrollY + window.innerHeight;

    const newSize = getWindowSize();
    const sizeChanged =
      newSize.x !== this.windowSize.x || newSize.y !== this.windowSize.y;
    this.windowSize = newSize;

    const newState = {
      height: this.footerSize.y,
      width: this.footerSize.x,
    };

    if (viewY > maxY && (sizeChanged || this.mode !== 'inline')) {
      this.mode = 'inline';
      newState.top = 0;
      newState.position = 'absolute';
      this.setState(newState);
    } else if (viewY <= maxY && (sizeChanged || this.mode !== 'fixed')) {
      this.mode = 'fixed';
      newState.top = window.innerHeight - this.footerSize.y;
      newState.position = 'fixed';
      this.setState(newState);
    }
  });
  getWrapper = ref => {
    this.wrapper = ref;
  };
  getToolbar = ref => {
    this.footer = ref;
  };

  render() {
    const { onSave, onReset, onDelete } = this.props;
    const { height, position, top, width } = this.state;

    const wrapperStyle = { height };
    const footerStyle = { height, position, top, width };

    return (
      <Wrapper innerRef={this.getWrapper} style={wrapperStyle} key="wrapper">
        <Toolbar innerRef={this.getToolbar} style={footerStyle} key="footer">
          <div>
            <Button appearance="primary" onClick={onSave}>
              Save Changes
            </Button>
            <Button appearance="reset" variant="link" onClick={onReset}>
              Reset Changes
            </Button>
          </div>
          <div>
            <Button appearance="delete" variant="link" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </Toolbar>
      </Wrapper>
    );
  }
}
