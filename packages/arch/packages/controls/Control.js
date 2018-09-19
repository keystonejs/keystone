// @flow
import React, { Component, type ComponentType, type Node, type Ref } from 'react';

import { HiddenInput } from '../input';
import { Wrapper, Label, Text, Svg, Icon } from '../primitives';

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
  components: {
    Wrapper?: ComponentType<*>,
    Label?: ComponentType<*>,
    Text?: ComponentType<*>,
  },
};

const defaultComponents = { Wrapper, Label, Text };

export default class Control extends Component<ControlProps, State> {
  components: {};
  control: HTMLElement;
  state = {
    isActive: false,
    isFocused: false,
    isHovered: false,
    mouseIsDown: false,
  };
  static defaultProps = {
    checked: false,
    components: {},
    isDisabled: false,
  };

  constructor(props: Props) {
    super(props);
    this.cacheComponents(props.components);
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.components !== this.props.components) {
      this.cacheComponents(nextProps.components);
    }
  }
  cacheComponents = (components?: {}) => {
    this.components = {
      ...defaultComponents,
      ...components,
    };
  };

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
      tabIndex,
      type,
      value,
      ...wrapperProps
    } = this.props;
    const { components } = this;
    const iconProps = { ...this.state, checked, isDisabled };

    return (
      <components.Wrapper {...wrapperProps}>
        <components.Label
          isChecked={checked}
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
            tabIndex={tabIndex || checked ? '0' : '-1'}
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
          {children ? <components.Text>{children}</components.Text> : null}
        </components.Label>
      </components.Wrapper>
    );
  }
}
