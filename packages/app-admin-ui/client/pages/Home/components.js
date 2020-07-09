/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { withPseudoState } from 'react-pseudo-state';
import { useList } from '../../providers/List';

import CreateItemModal from '../../components/CreateItemModal';

import { PlusIcon } from '@primer/octicons-react';
import { Card } from '@arch-ui/card';
import { colors, gridSize } from '@arch-ui/theme';
import { LoadingIndicator } from '@arch-ui/loading';
import { A11yText } from '@arch-ui/typography';

export const HeaderInset = props => (
  <div css={{ paddingLeft: gridSize * 2, paddingRight: gridSize * 2 }} {...props} />
);

const BOX_GUTTER = `${gridSize * 2}px`;

const BoxElement = props => (
  <Card
    css={{
      color: colors.N40,
      display: 'block',
      padding: BOX_GUTTER,
      position: 'relative',

      '&:hover, &:focus': {
        outline: 0,
        textDecoration: 'none',
      },
    }}
    {...props}
  />
);

const BoxComponent = ({ focusOrigin, isActive, isHover, isFocus, meta, ...props }) => {
  const { list, openCreateItemModal } = useList();
  const { label, singular } = list;

  return (
    <Fragment>
      <BoxElement as={Link} isInteractive title={`Go to ${label}`} {...props}>
        <A11yText>Go to {label}</A11yText>
        <Name
          isHover={isHover || isFocus}
          // this is aria-hidden since the label above shows the label already
          // so if this wasn't aria-hidden screen readers would read the label twice
          aria-hidden
        >
          {label}
        </Name>
        <Count meta={meta} />
        <CreateButton
          title={`Create ${singular}`}
          isHover={isHover || isFocus}
          onClick={e => {
            e.preventDefault();
            openCreateItemModal();
          }}
        >
          <PlusIcon />
          <A11yText>Create {singular}</A11yText>
        </CreateButton>
      </BoxElement>
      <CreateItemModal viewOnSave />
    </Fragment>
  );
};

export const Box = withPseudoState(BoxComponent);

export const Name = ({ isHover, ...props }) => (
  <span
    css={{
      borderBottom: `1px solid ${isHover ? colors.B.A50 : 'transparent'}`,
      color: colors.primary,
      display: 'inline-block',
      boxSizing: 'border-box',
      fontSize: '1.1rem',
      fontWeight: 500,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'border-color 80ms linear',
      whiteSpace: 'nowrap',
      marginRight: '2em',
    }}
    {...props}
  />
);

export const Count = ({ meta }) => {
  const isLoading = meta === undefined;
  const count = (meta && meta.count) || 0;

  return isLoading ? (
    <div css={{ height: '0.85em' }}>
      <LoadingIndicator />
    </div>
  ) : (
    <div css={{ fontSize: '0.85em' }}>{`${count} Item${count !== 1 ? 's' : ''}`}</div>
  );
};

export const CreateButton = ({ isHover, ...props }) => (
  <button
    css={{
      alignItems: 'center',
      backgroundColor: isHover ? colors.N20 : colors.N10,
      borderRadius: '2px',
      border: 0,
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      height: '24px',
      justifyContent: 'center',
      outline: 0,
      position: 'absolute',
      right: BOX_GUTTER,
      top: BOX_GUTTER,
      transition: 'background-color 80ms linear',
      width: '24px',

      '&:hover, &:focus': {
        backgroundColor: colors.create,
      },
    }}
    {...props}
  />
);
