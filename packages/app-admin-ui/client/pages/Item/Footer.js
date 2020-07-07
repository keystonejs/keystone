/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, memo, useEffect } from 'react';
import { Button, LoadingButton } from '@arch-ui/button';
import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

import { useList } from '../../providers/List';

const Toolbar = props => (
  <div
    css={{
      backgroundColor: alpha('#fff', 0.93),
      bottom: 0,
      boxShadow: `${alpha(colors.text, 0.1)} 0px -2px 0px`,
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: gridSize * 2,
      paddingTop: gridSize * 2,
      position: 'sticky',
    }}
    {...props}
  />
);

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

export default memo(
  ({ onSave, onDelete, canReset, updateInProgress, onReset, hasWarnings, hasErrors }) => {
    const { list } = useList();
    const cypressId = 'item-page-save-button';

    return (
      <Fragment>
        <Toolbar key="footer">
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <LoadingButton
              appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
              id={cypressId}
              isDisabled={updateInProgress || hasErrors || !list.access.update}
              isLoading={updateInProgress}
              onClick={onSave}
              style={{ marginRight: 8 }}
              type="submit"
            >
              {hasWarnings && !hasErrors ? 'Ignore Warnings and Save Changes' : 'Save Changes'}
            </LoadingButton>
            <Reset canReset={canReset} onReset={onReset} />
          </div>
          <div>
            <Button
              appearance="danger"
              isDisabled={updateInProgress || !list.access.delete}
              variant="nuance"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </Toolbar>
      </Fragment>
    );
  }
);
