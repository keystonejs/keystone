/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, memo, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button, LoadingButton } from '@arch-ui/button';
import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';
import ContainerQuery from '../../components/ContainerQuery';

const Placeholder = styled.div({
  // height: 100,
});
const Toolbar = styled.div({
  backgroundColor: alpha('#fff', 0.93),
  bottom: 0,
  boxShadow: `${alpha(colors.text, 0.1)} 0px -2px 0px`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${gridSize * 3}px 0`,
  // position: 'fixed',
});

function useKeyListener(listener, deps) {
  useEffect(() => {
    document.addEventListener('keydown', listener, false);
    return () => {
      document.removeEventListener('keydown', listener, false);
    };
  }, deps);
}

function Reset({ canReset, onReset }) {
  let [resetRequested, setResetRequested] = useState(false);

  useKeyListener(
    event => {
      if (!event.defaultPrevented && event.key === 'Escape') {
        setResetRequested(false);
      }
    },
    [setResetRequested]
  );

  if (!canReset && resetRequested) {
    setResetRequested(false);
  }

  return resetRequested ? (
    <div css={{ display: 'flex', alignItems: 'center', marginLeft: gridSize }}>
      <div css={{ fontSize: '0.9rem', marginRight: gridSize }}>Are you sure?</div>
      <Button appearance="danger" autoFocus onClick={onReset} variant="ghost">
        Reset
      </Button>
      <Button
        variant="subtle"
        onClick={() => {
          setResetRequested(false);
        }}
      >
        Cancel
      </Button>
    </div>
  ) : (
    <Button
      appearance="warning"
      isDisabled={!canReset}
      variant="subtle"
      onClick={() => {
        setResetRequested(true);
      }}
    >
      Reset Changes
    </Button>
  );
}

export default memo(function Footer(props) {
  const { onSave, onDelete, canReset, updateInProgress, onReset } = props;

  return (
    <ContainerQuery
      render={({ ref, width }) => (
        <Fragment>
          <Placeholder ref={ref} />
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
              <Reset canReset={canReset} onReset={onReset} />
            </div>
            <div>
              <Button
                appearance="danger"
                isDisabled={updateInProgress}
                variant="nuance"
                onClick={onDelete}
              >
                Delete
              </Button>
            </div>
          </Toolbar>
        </Fragment>
      )}
    />
  );
});
