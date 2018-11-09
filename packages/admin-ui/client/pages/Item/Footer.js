/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button, LoadingButton } from '@voussoir/ui/src/primitives/buttons';
import { gridSize } from '@voussoir/ui/src/theme';
import ContainerQuery from '../../components/ContainerQuery';

const Placeholder = styled.div({
  height: 100,
});
const Toolbar = styled.div({
  backgroundColor: 'rgba(250, 251, 252, 0.93)',
  bottom: 0,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px -2px 0px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${gridSize * 3}px 0`,
  position: 'fixed',
});

export default function Footer(props) {
  const { onSave, onDelete, resetInterface, updateInProgress } = props;

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
      )}
    />
  );
}
Footer.propTypes = {
  onDelete: PropTypes.func,
  onReset: PropTypes.func,
  onSave: PropTypes.func,
};
