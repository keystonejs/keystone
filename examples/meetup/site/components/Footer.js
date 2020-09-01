/** @jsx jsx */
import { jsx } from '@emotion/core';
import getConfig from 'next/config';

import { Button, Html } from '../primitives';
import { colors, gridSize, shadows } from '../theme';
import { getForegroundColor } from '../helpers';
import { mq } from '../helpers/media';

const { publicRuntimeConfig } = getConfig();

const Footer = ({ callToAction = true }) => {
  const { meetup } = publicRuntimeConfig;
  const marginTop = (callToAction ? 16 : 32) * gridSize;
  const slantHeight = callToAction ? 15 : 5;
  const button = {
    bg: meetup.themeColor,
    fg: getForegroundColor(meetup.themeColor),
  };

  return (
    <div css={{ marginTop }}>
      <div css={{ position: 'relative' }}>
        {callToAction && (
          <CallToAction>
            <Html markup={meetup.footer.callToActionText} />
            <Button background={button.bg} foreground={button.fg} href="/signup">
              {meetup.footer.callToActionButtonLabel}
            </Button>
          </CallToAction>
        )}
        <Slant height={slantHeight} />
      </div>
      <section
        css={{
          background: colors.greyDark,
          color: 'white',
          padding: `${gridSize * 8}px 0`,
          textAlign: 'center',

          a: {
            color: 'white',
            fontWeight: 600,
          },
        }}
      >
        <img
          src={meetup.logo.src}
          width={meetup.logo.width}
          height={meetup.logo.height}
          alt={meetup.name}
          css={{ marginRight: gridSize * 2 }}
        />
        <Html markup={meetup.footer.copyrightText} />
      </section>
    </div>
  );
};

const CallToAction = props => {
  const paddingHorizontal = ['2rem', '6rem'];
  const paddingVertical = '2rem';

  return (
    <div
      css={mq({
        background: [null, 'white'],
        boxShadow: [null, shadows.lg],
        boxSizing: 'border-box',
        margin: '0 auto',
        maxWidth: 800,
        paddingBottom: paddingVertical,
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
        paddingTop: paddingVertical,
        position: 'relative',
        textAlign: 'center',
        zIndex: 2,
      })}
      {...props}
    />
  );
};

const Slant = ({ height }) => (
  <svg
    css={{
      bottom: 0,
      display: 'block',
      height: `${height}vw`,
      position: 'absolute',
      width: '100vw',
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <polygon fill={colors.greyDark} points="0, 0 100, 100 0, 100" />
  </svg>
);

export default Footer;
