// @flow
import React, { Component, type Node, type Ref, type ElementType } from 'react';
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

type Props = {
  children?: Node,
  /** Field disabled */
  isDisabled?: boolean,
  /** Marks this as a required field */
  isRequired?: boolean,
  /** Set the field as selected */
  checked?: boolean,
  /** Field name */
  name?: string,
  /** onChange event handler */
  onChange: any => mixed,
  /** Field value */
  value: string,
  /** Ref to apply to the inner Element */
  innerRef?: Ref<*>,
};

type Components = {
  Wrapper?: ElementType,
  Label?: ElementType,
  Text?: ElementType,
};

export type ControlProps = Props & {
  svg: string, // html string
  type: 'checkbox' | 'radio',
  tabIndex?: string,
  components: Components,
};

type IconProps = {
  checked: boolean,
  isActive: boolean,
  isDisabled: boolean,
  isFocus: boolean,
  isHover: boolean,
};
const Icon = styled.div(({ checked, isDisabled, isFocus, isActive, isHover }: IconProps) => {
  // background
  let bg = colors.N10;
  if (isDisabled && checked) {
    bg = colors.B.D20;
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
  if (checked) {
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

export class Control extends Component<ControlProps> {
  control: HTMLElement | null;
  static defaultProps = {
    checked: false,
    components: {},
    isDisabled: false,
  };
  cacheComponents = memoize((components: $Shape<Components>) => ({
    ...defaultComponents,
    ...components,
  }));

  focus() {
    if (this.control) this.control.focus();
  }
  blur() {
    if (this.control) this.control.blur();
  }
  getRef = (ref: HTMLElement | null) => {
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
                  tabIndex={tabIndex || checked ? '0' : '-1'}
                  type={type}
                  value={value}
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
