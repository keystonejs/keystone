/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { withPseudoState } from 'react-pseudo-state';

import { PlusIcon } from '@arch-ui/icons';
import { colors, borderRadius, gridSize } from '@arch-ui/theme';
import { LoadingIndicator } from '@arch-ui/loading';
import { A11yText } from '@arch-ui/typography';

import { withRouter, Link } from '../../providers/Router';

const BOX_GUTTER = `${gridSize * 2}px`;

const BoxElement = styled.div`
  background-color: white;
  border-radius: ${borderRadius}px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: block;
  line-height: 1.1;
  padding: ${BOX_GUTTER};
  position: relative;
  transition: box-shadow 80ms linear;

  &:hover,
  &:focus {
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px ${colors.B.A60};
    outline: 0;
    text-decoration: none;
  }
  &:active {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 0 1px ${colors.B.A60};
    bottom: -1px;
  }
`;

const BoxComponent = withRouter(
  ({
    focusOrigin,
    isActive,
    isHover,
    isFocus,
    list,
    meta,
    onCreateClick,
    route,
    params,
    router,
    ...props
  }) => {
    const { label, singular } = list;

    return (
      <BoxElement
        title={`Go to ${label}`}
        onClick={() => router.push({ route, params })}
        {...props}
        css={{ cursor: isHover ? 'pointer' : 'normal' }}
      >
        <Link route={route} params={params}>
          <a css={{ '&:hover': { textDecoration: 'none' } }}>
            <A11yText>Go to {label}</A11yText>
            <Name
              isHover={isHover || isFocus}
              // this is aria-hidden since the label above shows the label already
              // so if this wasn't aria-hidden screen readers would read the label twice
              aria-hidden
            >
              {label}
            </Name>
            <Count meta={meta} css={{ color: colors.N40 }} />
          </a>
        </Link>
        <CreateButton
          title={`Create ${singular}`}
          isHover={isHover || isFocus}
          onClick={event => {
            // So we don't trigger the wrapping box's `onClick`
            event.stopPropagation();
            onCreateClick(event);
          }}
        >
          <PlusIcon />
          <A11yText>Create {singular}</A11yText>
        </CreateButton>
      </BoxElement>
    );
  }
);

export const ListBox = withPseudoState(BoxComponent);

export const Name = styled.span(
  ({ isHover }) => `
  border-bottom: 1px solid ${isHover ? colors.B.A50 : 'transparent'};
  color: ${colors.primary};
  display: inline-block;
  font-size: 1.1em;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color 80ms linear;
  white-space: nowrap;
`
);
export const Count = ({ meta, ...props }) => {
  const isLoading = meta === undefined;
  const count = (meta && meta.count) || 0;

  return isLoading ? (
    <div css={{ height: '0.85em' }} {...props}>
      <LoadingIndicator />
    </div>
  ) : (
    <div css={{ fontSize: '0.85em' }} {...props}>
      {count}
      {/* append the text instead of two children so that they're a single text node for screen readers */}
      {' Item' + (count !== 1 ? 's' : '')}
    </div>
  );
};
export const CreateButton = styled.button(
  ({ isHover }) => `
  align-items: center;
  background-color: ${isHover ? colors.N20 : colors.N10};
  border-radius: 2px;
  border: 0;
  color: white;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  outline: 0;
  position: absolute;
  right: ${BOX_GUTTER};
  top: ${BOX_GUTTER};
  transition: background-color 80ms linear;
  width: 24px;

  &:hover, &:focus {
    background-color: ${colors.create};
  }
`
);
