// @flow
import React, { Component, type Node, type Ref } from 'react';
import styled from 'react-emotion';
import {
  CheckboxGroup as ReactCheckboxGroup,
  Checkbox as ReactCheckbox,
  RadioGroup as ReactRadioGroup,
  Radio as ReactRadio,
} from 'react-radios';

import { colors } from '../../theme';
import { HiddenInput } from './index';

const Wrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
const Label = styled.label({
  alignItems: 'center',
  display: 'flex',
  lineHeight: 1,
});

type State = {
  isHovered: boolean,
  isFocused: boolean,
  isActive: boolean,
  mouseIsDown: boolean,
};
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
type ControlProps = Props & {
  svg: string, // html string
  type: 'checkbox' | 'radio',
};

type IconProps = {
  isActive: boolean,
  checked: boolean,
  isDisabled: boolean,
  isFocused: boolean,
};
const Icon = styled.div(
  ({ isDisabled, isFocused, checked, isActive }: IconProps) => {
    // background
    let bg = colors.N05;
    if (isDisabled && checked) {
      bg = colors.B.D20;
    } else if (isDisabled) {
      bg = colors.N10;
    } else if (isActive) {
      bg = checked ? colors.B.D10 : colors.N10;
    } else if (isFocused && !checked) {
      bg = 'white';
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
    let innerStroke = isFocused ? colors.B.L20 : colors.N30;
    let innerStrokeWidth = 1;
    if (checked) {
      innerStroke = isActive ? colors.B.D20 : colors.B.base;
    }
    let outerStroke = 'transparent';
    let outerStrokeWidth = 1;
    if (isFocused && !isActive) {
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
  }
);

class Control extends Component<ControlProps, State> {
  static defaultProps = {
    checked: false,
    isDisabled: false,
  };

  state = {
    isActive: false,
    isFocused: false,
    isHovered: false,
    mouseIsDown: false,
  };

  control: HTMLElement;
  focus() {
    this.control.focus();
  }
  blur() {
    this.control.blur();
  }
  getRef = (ref: HTMLElement) => {
    this.control = ref;
  };

  onBlur = () =>
    this.setState({
      // onBlur is called after onMouseDown if the checkbox was focused, however
      // in this case on blur is called immediately after, and we need to check
      // whether the mouse is down.
      isActive: this.state.mouseIsDown && this.state.isActive,
      isFocused: false,
    });
  onFocus = () => this.setState({ isFocused: true });

  doActive = () => {
    this.setState({ isActive: true, mouseIsDown: true });
  };
  undoActive = () => {
    this.setState({ isActive: false, mouseIsDown: false });
  };

  onKeyDown = event => {
    if (event.key !== ' ') return;
    this.doActive();
  };
  onKeyUp = event => {
    if (event.key !== ' ') return;
    this.undoActive();
  };
  onMouseLeave = () => this.setState({ isActive: false, isHovered: false });
  onMouseEnter = () => this.setState({ isHovered: true });
  onMouseUp = () => this.undoActive();
  onMouseDown = () => this.doActive();

  render() {
    const {
      children,
      isDisabled,
      isRequired,
      checked,
      name,
      onChange,
      svg,
      type,
      value,
      ...wrapperProps
    } = this.props;
    const iconProps = { ...this.state, checked, isDisabled };

    return (
      <Wrapper {...wrapperProps}>
        <Label
          isDisabled={isDisabled}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <HiddenInput
            checked={checked}
            disabled={isDisabled}
            innerRef={this.getRef}
            name={name}
            onBlur={this.onBlur}
            onChange={onChange}
            onFocus={this.onFocus}
            required={isRequired}
            type={type}
            value={value}
          />
          <Icon {...iconProps}>
            <Svg html={svg} />
          </Icon>
          {children ? <span>{children}</span> : null}
        </Label>
      </Wrapper>
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

export const CheckboxPrimitive = ({ innerRef, ...props }: Props) => (
  <Control
    ref={innerRef}
    svg={`<g fillRule="evenodd">
      <rect class="outer-stroke" fill="transparent" x="6" y="6" width="12" height="12" rx="2" />
      <rect class="inner-stroke" fill="currentColor" x="6" y="6" width="12" height="12" rx="2" />
      <path
        d="M9.707 11.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 1 0-1.414-1.414L11 12.586l-1.293-1.293z"
        fill="inherit"
      />
    </g>`}
    type="checkbox"
    {...props}
  />
);
export const Checkbox = (props: Props) => (
  <ReactCheckbox component={CheckboxPrimitive} {...props} />
);
export const CheckboxGroup = (props: Props) => (
  <ReactCheckboxGroup {...props} />
);
export const RadioPrimitive = ({ innerRef, ...props }: Props) => (
  <Control
    ref={innerRef}
    svg={`<g fillRule="evenodd">
    <circle class="outer-stroke" fill="transparent" cx="12" cy="12" r="7" />
    <circle class="inner-stroke" fill="currentColor" cx="12" cy="12" r="7" />
    <circle fill="inherit" cx="12" cy="12" r="2" />
  </g>`}
    type="radio"
    {...props}
  />
);
export const Radio = (props: Props) => (
  <ReactRadio component={RadioPrimitive} {...props} />
);
export const RadioGroup = (props: Props) => <ReactRadioGroup {...props} />;
