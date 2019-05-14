/** @jsx jsx */
import { jsx } from '@emotion/core';
import getConfig from 'next/config';

import CallToAction from '../components/CallToAction';
import { gridSize, colors } from '../theme';

const { publicRuntimeConfig } = getConfig();

const Slant = () => (
  <svg
    css={{ height: '15vw', width: '100vw', display: 'block', position: 'absolute', bottom: 0 }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <polygon fill={colors.greyDark} points="0, 0 100, 100 0, 100" />
  </svg>
);

const Footer = ({ callToAction = true }) => {
  const { meetup } = publicRuntimeConfig;
  const margin = callToAction ? 16 : 32;

  return (
    <div css={{ marginTop: `${margin}px` }}>
      <div css={{ position: 'relative' }}>
        {callToAction && <CallToAction />}
        <Slant />
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
        <div dangerouslySetInnerHTML={{ __html: meetup.footer.copyrightText }} />
      </section>
    </div>
  );
};

export default Footer;
