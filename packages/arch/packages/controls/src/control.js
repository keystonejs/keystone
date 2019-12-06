import React, { Component } from 'react';
import memoize from 'memoize-one';
import { PseudoState } from 'react-pseudo-state';
import styled from '@emotion/styled';

import { colors } from '@arch-ui/theme';
import { HiddenInput } from '@arch-ui/input';

const Wrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
const Label = styled.label({
  alignItems: 'center',
  display: 'flex',
  lineHeight: 1,
});
const Text = 'span';

const Icon = styled.div(({ checked, isDisabled, isFocus, isActive, isHover }) => {
  // background
  let bg = colors.N10;
  if (isDisabled && checked) {
    bg = colors.N30;
  } else if (isActive) {
    bg = checked ? colors.B.D10 : colors.N20;
  } else if ((isFocus || isHover) && !checked) {
    bg = colors.N15;
  } else if (checked) {
    bg = colors.B.base;
  }

  // fill
  let fill = 'white';
  if (isDisabled && checked) {
    fill = colors.N70;
  } else if (!checked) {
    fill = 'transparent';
  }

  // stroke
  let innerStroke = isFocus ? colors.B.L20 : bg;
  let innerStrokeWidth = 1;
  if (checked && !isDisabled) {
    innerStroke = isActive ? colors.B.D20 : colors.B.base;
  }

  let outerStroke = 'transparent';
  let outerStrokeWidth = 1;
  if (isFocus && !isActive) {
    outerStroke = colors.B.A20;
    outerStrokeWidth = 5;
  }

  return {
    color: bg,
    fill,
    lineHeight: 0,
    cursor: isDisabled ? 'not-allowed' : null,

    // awkwardly apply the focus ring
    '& .outer-stroke': {
      transition: 'stroke 0.2s ease-in-out',
      stroke: outerStroke,
      strokeWidth: outerStrokeWidth,
    },
    '& .inner-stroke': {
      stroke: innerStroke,
      strokeWidth: innerStrokeWidth,
    },
  };
});

const defaultComponents = { Wrapper, Label, Text };

export class Control extends Component {
  static defaultProps = {
    checked: false,
    components: {},
    isDisabled: false,
  };
  cacheComponents = memoize(components => ({
    ...defaultComponents,
    ...components,
  }));

  focus() {
    if (this.control) this.control.focus();
  }
  blur() {
    if (this.control) this.control.blur();
  }
  getRef = ref => {
    this.control = ref;
  };

  render() {
    const {
      checked,
      children,
      isDisabled,
      isRequired,
      name,
      onChange,
      svg,
      tabIndex,
      type,
      value,
      id,
      ...wrapperProps
    } = this.props;
    const components = this.cacheComponents(this.props.components);

    return (
      <components.Wrapper {...wrapperProps}>
        <PseudoState>
          {(
            {
              onBlur,
              onFocus,
              onKeyDown,
              onKeyUp,
              onMouseDown,
              onMouseEnter,
              onMouseLeave,
              onMouseUp,
              onTouchEnd,
              onTouchStart,
            },
            snapshot
          ) => {
            const labelHandlers = {
              onMouseDown,
              onMouseUp,
              onMouseEnter,
              onMouseLeave,
              onTouchEnd,
              onTouchStart,
            };
            const inputHandlers = { onBlur, onChange, onFocus, onKeyDown, onKeyUp };
            const iconProps = { ...snapshot, checked, isDisabled };

            return (
              <components.Label isChecked={checked} isDisabled={isDisabled} {...labelHandlers}>
                <HiddenInput
                  {...inputHandlers}
                  checked={checked}
                  disabled={isDisabled}
                  innerRef={this.getRef}
                  name={name}
                  required={isRequired}
                  tabIndex={tabIndex}
                  type={type}
                  value={value}
                  id={id}
                />
                <Icon {...iconProps}>
                  <Svg html={svg} />
                </Icon>
                {children ? <components.Text>{children}</components.Text> : null}
              </components.Label>
            );
          }}
        </PseudoState>
      </components.Wrapper>
    );
  }
}

const Svg = ({ html, ...props }) => (
  <svg
    dangerouslySetInnerHTML={{ __html: html }}
    focusable="false"
    height="24"
    role="presentation"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  />
);
