/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

import { Container } from '../primitives';
import { H1 } from '../primitives/Typography';
import { colors, fontSizes } from '../theme';

export const Hero = ({
  align,
  backgroundColor,
  foregroundColor,
  children,
  subTitle,
  superTitle,
  title,
  ...props
}) => {
  const horizontalMargin = align === 'center' ? 'auto' : null;
  return (
    <>
      <Wrapper
        align={align}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        {...props}
      >
        <Container>
          {superTitle && <Subtitle>{superTitle}</Subtitle>}
          <H1>{title}</H1>
          {subTitle && <Subtitle>{subTitle}</Subtitle>}
          <Content horizontalMargin={horizontalMargin}>{children}</Content>
        </Container>
      </Wrapper>
      <svg
        css={{ height: '5vw', width: '100vw' }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon fill={backgroundColor} points="0, 100 0, 0 100, 0" />
      </svg>
    </>
  );
};

Hero.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  backgroundColor: PropTypes.string.isRequired,
  children: PropTypes.node,
  foregroundColor: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  superTitle: PropTypes.string,
  title: PropTypes.string.isRequired,
};
Hero.defaultProps = {
  align: 'center',
  backgroundColor: colors.greyDark,
  foregroundColor: 'white',
};

// styled components

const Wrapper = ({ align, backgroundColor, foregroundColor, ...props }) => (
  <div
    css={{
      backgroundColor: backgroundColor,
      color: foregroundColor,
      padding: '7rem 0',
      textAlign: align,
    }}
    {...props}
  />
);

const Content = ({ horizontalMargin, ...props }) => (
  <div
    css={{
      fontSize: [fontSizes.sm, fontSizes.md],
      marginLeft: horizontalMargin,
      marginRight: horizontalMargin,
      marginTop: 30,
      maxWidth: 720,

      a: {
        color: 'inherit',
      },
    }}
    {...props}
  />
);

const Subtitle = ({ horizontalMargin, ...props }) => (
  <div
    css={{
      fontSize: fontSizes.md,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    }}
    {...props}
  />
);
