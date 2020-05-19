/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment, useRef, useCallback } from 'react';

import { colors, gridSize } from '@arch-ui/theme';
import { Popout } from '../../../components/Popout';
import AnimateHeight from '../../../components/AnimateHeight';

const FooterButton = ({ isPrimary, ...props }) => (
  <button
    type="button"
    css={{
      background: 0,
      border: 0,
      cursor: 'pointer',
      color: isPrimary ? colors.primary : colors.N40,
      fontSize: '1rem',
      fontWeight: isPrimary ? 'bold' : null,
      margin: -gridSize,
      padding: gridSize,

      ':hover, :focus': {
        outline: 0,
        textDecoration: 'underline',
      },
    }}
    {...props}
  />
);

const FilterPopout = ({ children, ...props }) => {
  const { onSubmit, showFooter } = props;

  const popoutRef = useRef();
  const popoutBody = useRef();

  const close = event => {
    popoutRef.current.close(event);

    // prevent form submission
    // default must be prevented after the popoutRef receives the call to close
    if (event) event.preventDefault();
  };

  // Refs
  // ==============================

  const getPopoutRef = ref => {
    if (ref) popoutRef.current = ref;
  };

  const getPopoutBody = ref => {
    if (ref) popoutBody.current = ref;
  };

  const renderFooter = () => {
    return showFooter ? (
      <Fragment>
        <FooterButton onClick={close}>Cancel</FooterButton>
        <FooterButton type="submit" isPrimary>
          Apply
        </FooterButton>
      </Fragment>
    ) : null;
  };

  const popoutForm = useCallback(
    props => (
      <form
        onSubmit={event => {
          close(event);
          onSubmit(event);
        }}
        {...props}
      />
    ),
    [onSubmit]
  );

  return (
    <Popout
      component={popoutForm}
      bodyRef={getPopoutBody}
      innerRef={getPopoutRef}
      footerContent={renderFooter()}
      {...props}
    >
      <AnimateHeight
        autoScroll={popoutBody}
        style={{ position: 'relative' }}
        initialHeight={0}
        render={children}
      />
    </Popout>
  );
};

export default FilterPopout;
