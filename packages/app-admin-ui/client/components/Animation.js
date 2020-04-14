/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import { useState } from 'react';

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

const Animation = ({
  duration = '1s',
  isInfinite = false,
  tag: Tag = 'div',
  timing = 'ease',
  ...props
}) => {
  const [hasAnimation, setHasAnimation] = useState(true);
  const [name, setName] = useState(props.name);

  if (!hasAnimation && props.name !== name) {
    setHasAnimation(true);
    setName(props.name);
  }

  const onAnimationEnd = () => {
    setHasAnimation(false);
  };

  const infinite = isInfinite ? 'infinite' : '';
  const animation = `${animations[name]} ${duration} ${timing} ${infinite}`;

  return (
    <Tag css={hasAnimation ? { animation } : null} onAnimationEnd={onAnimationEnd} {...props} />
  );
};

export default Animation;
