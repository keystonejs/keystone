// @flow
import React, { Component, type ComponentType, type ElementRef } from 'react';
import styled from 'react-emotion';
import RadioGroup from 'react-radio-group';

import { colors } from '../../theme';

const Wrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
const Label = styled.label({
  alignItems: 'center',
  display: 'flex',
  lineHeight: 1,
});
const HiddenInput = styled.input({
  border: 0,
  clip: 'rect(1px, 1px, 1px, 1px)',
  height: 1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
  opacity: 0,
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
  isChecked?: boolean,
  /** Field name */
  name?: string,
  /** onChange event handler */
  onChange: any => mixed,
  /** Field value */
  value: string,
};
type ControlProps = Props & {
  svg: string, // html string
  type: 'checkbox' | 'radio',
};

type IconProps = {
  isActive: boolean,
  isChecked: boolean,
  isDisabled: boolean,
  isFocused: boolean,
};
const Icon = styled.div(
  ({ isDisabled, isFocused, isChecked, isActive }: IconProps) => {
    // background
    let bg = colors.N05;
    if (isDisabled && isChecked) {
      bg = colors.B.D20;
    } else if (isDisabled) {
      bg = colors.N10;
    } else if (isActive) {
      bg = isChecked ? colors.B.D10 : colors.N10;
    } else if (isFocused && !isChecked) {
      bg = 'white';
    } else if (isChecked) {
      bg = colors.B.base;
    }

    // fill
    let fill = 'white';
    if (isDisabled && isChecked) {
      fill = colors.N70;
    } else if (!isChecked) {
      fill = 'transparent';
    }

    // stroke
    let innerStroke = isFocused ? colors.B.L20 : colors.N30;
    let innerStrokeWidth = 1;
    if (isChecked) {
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
    isChecked: false,
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
  onChange = event => {
    this.props.onChange(event.target.checked);
  };
  render() {
    const {
      children,
      isDisabled,
      isRequired,
      isChecked,
      name,
      svg,
      type,
      value,
    } = this.props;
    const iconProps = { ...this.state, isChecked, isDisabled };

    return (
      <Wrapper>
        <Label
          isDisabled={isDisabled}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <input
            // checked={isChecked}
            disabled={isDisabled}
            innerRef={this.getRef}
            name={name}
            onBlur={this.onBlur}
            onChange={this.onChange}
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

// ==============================
// State Manager
// ==============================

type ManagerProps = { isChecked?: boolean, defaultIsChecked: boolean };
type ManagerState = { isChecked: boolean };

const manageState = (ControlComponent: ComponentType<*>) =>
  class StateManager extends Component<ManagerProps, ManagerState> {
    static defaultProps = {
      defaultIsChecked: false,
    };

    control: ElementRef<*>;

    state = {
      isChecked:
        this.props.isChecked !== undefined
          ? this.props.isChecked
          : this.props.defaultIsChecked,
    };
    focus() {
      this.control.focus();
    }
    blur() {
      this.control.blur();
    }
    getProp(key: string) {
      return this.props[key] !== undefined ? this.props[key] : this.state[key];
    }
    callProp(name: string, ...args: any) {
      if (typeof this.props[name] === 'function') {
        return this.props[name](...args);
      }
    }
    onChange = (isChecked: any) => {
      this.callProp('onChange', isChecked);
      this.setState({ isChecked });
    };
    getRef = (ref: ElementRef<*>) => {
      this.control = ref;
    };
    render() {
      if (this.props.type === 'radio') {
        console.log('manager', this.state.isChecked);
      }
      return (
        <ControlComponent
          {...this.props}
          ref={this.getRef}
          onChange={this.onChange}
          isChecked={this.getProp('isChecked')}
        />
      );
    }
  };

const ManagedControl = manageState(Control);
export const Checkbox = (props: Props) => (
  <ManagedControl
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
export const Radio = (props: Props, context) => {
  console.log('Radio', context);
  return (
    <ManagedControl
      svg={`<g fillRule="evenodd">
      <circle class="outer-stroke" fill="transparent" cx="12" cy="12" r="7" />
      <circle class="inner-stroke" fill="currentColor" cx="12" cy="12" r="7" />
      <circle fill="inherit" cx="12" cy="12" r="3" />
    </g>`}
      type="radio"
      {...props}
    />
  );
};
