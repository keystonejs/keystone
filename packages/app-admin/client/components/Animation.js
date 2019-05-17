// @flow
/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import { Component, type ElementType } from 'react';

const pulse = keyframes`
  from { transform: scale3d(1, 1, 1); }
  50% { transform: scale3d(1.5, 1.5, 1.5); }
  to { transform: scale3d(1, 1, 1); }
`;
const shake = keyframes`
  from, to { transform: translate3d(0, 0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
  20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }
`;
const tada = keyframes`
  from { transform: scale3d(1, 1, 1); }
  10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); }
  30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
  40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
  to { transform: scale3d(1, 1, 1); }
`;

const animations = {
  pulse,
  shake,
  tada,
};

type Props = {
  name: $Keys<typeof animations>,
  tag: ElementType,
  duration: string,
  isInfinite: boolean,
  timing: string,
};

type State = { hasAnimation: boolean, name: string };

export default class Animation extends Component<Props, State> {
  state = {
    hasAnimation: true,
    name: this.props.name,
  };
  static defaultProps = {
    duration: '1s',
    isInfinite: false,
    tag: 'div',
    timing: 'ease',
  };
  static getDerivedStateFromProps(props: Props, state: State) {
    if (!state.hasAnimation && props.name !== state.name) {
      return { hasAnimation: true, name: props.name };
    }

    return null;
  }
  onAnimationEnd = () => {
    this.setState({ hasAnimation: false });
  };
  render() {
    const { duration, isInfinite, tag: Tag, timing, ...props } = this.props;
    const { hasAnimation, name } = this.state;
    const infinite = isInfinite ? 'infinite' : '';
    const animation = `${animations[name]} ${duration} ${timing} ${infinite}`;

    return (
      <Tag
        css={hasAnimation ? { animation } : null}
        onAnimationEnd={this.onAnimationEnd}
        {...props}
      />
    );
  }
}
