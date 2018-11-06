/** @jsx jsx */
import { jsx } from '@emotion/core';
import { createRef, Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import raf from 'raf-schd';
import { Button, LoadingButton } from '@voussoir/ui/src/primitives/buttons';
import { colors, gridSize } from '@voussoir/ui/src/theme';

const Placeholder = styled.div({
  height: 100,
});
const Toolbar = styled.div({
  backgroundColor: colors.page,
  bottom: 0,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px -2px 0px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${gridSize * 3}px 0`,
  position: 'fixed',
});

export default class Footer extends Component {
  wrapper = createRef();
  state = { width: 'auto' };
  static propTypes = {
    onDelete: PropTypes.func,
    onReset: PropTypes.func,
    onSave: PropTypes.func,
  };
  componentDidMount() {
    window.addEventListener('scroll', this.recalcPosition, false);
    window.addEventListener('resize', this.recalcPosition, false);
    this.recalcPosition();
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.recalcPosition, false);
    window.removeEventListener('resize', this.recalcPosition, false);
  }
  recalcPosition = raf(() => {
    // Due to the use of raf, this function may end up being called *after*
    // the component is unmounted. If this happens, we can safely return early.
    if (this.wrapper.current === null) return;

    this.setState({ width: this.wrapper.current.offsetWidth });
  });

  render() {
    const { onSave, onDelete, resetInterface, updateInProgress } = this.props;
    const { width } = this.state;

    return (
      <Fragment>
        <Placeholder ref={this.wrapper} key="wrapper" />
        <Toolbar style={{ width }} key="footer">
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <LoadingButton
              appearance="primary"
              isDisabled={updateInProgress}
              isLoading={updateInProgress}
              onClick={onSave}
              style={{ marginRight: 8 }}
              type="submit"
            >
              Save Changes
            </LoadingButton>
            {resetInterface}
          </div>
          <div>
            <Button
              appearance="danger"
              isDisabled={updateInProgress}
              variant="subtle"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </Toolbar>
      </Fragment>
    );
  }
}
