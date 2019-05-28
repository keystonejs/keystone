/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';

import { mq } from '../../utils/media';
import videoThumbnailPNG from '../../assets/video-thumbnail.png';

const VideoIntro = () => {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <MainWrapper>
      <VideoWrapper>
        <VideoEmbed
          showVideo={showVideo}
          onMouseEnter={() => setShowVideo(true)}
          onClick={() => setShowVideo(true)}
        />
        {!showVideo && <VideoStartButton onClick={() => setShowVideo(true)} />}
      </VideoWrapper>
      <VideoCta />
    </MainWrapper>
  );
};

// Implementation components
const MainWrapper = ({ children }) => (
  <div
    css={mq({
      marginLeft: [0, 0, 0, 50],
      flex: [1, '0 1 600px'],
    })}
  >
    {children}
  </div>
);
const VideoWrapper = ({ children, ...rest }) => (
  <div
    css={{
      backgroundColor: '#f2f2f2',
      backgroundImage: `url(${videoThumbnailPNG})`,
      backgroundPosition: 'center 0%',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      '&:before': {
        content: '""',
        display: 'block',
        width: '100%',
        paddingTop: '56.25%',
      },
    }}
    {...rest}
  >
    <div
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  </div>
);

const VideoEmbed = ({ showVideo, ...props }) => (
  <div
    css={{
      position: 'absolute',
      height: '100%',
      width: '100%',
      transition: 'opacity 0.3s',
      opacity: showVideo ? 1 : 0,
      iframe: {
        width: '100%',
        height: '100%',
        outline: 'none',
        border: 0,
      },
    }}
    {...props}
  >
    <iframe
      css={{ display: 'block' }}
      src="https://egghead.io/lessons/graphql-create-a-hello-world-todo-app-with-keystone-5/embed"
      frameBorder="0"
      allowFullScreen
    />
  </div>
);

const VideoStartButton = props => (
  <button
    css={{
      position: 'relative',
      height: '64px',
      width: '64px',
      display: 'block',
      content: '" "',
      boxShadow: '0 24px 48px 0 rgba(0,0,0,0.32)',
      borderRadius: 32,
      border: 'none',
      backgroundColor: '#fff',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: '#e7e7e7',
      },
      cursor: 'pointer',
    }}
    {...props}
  >
    <svg
      width="26"
      height="32"
      xmlns="http://www.w3.org/2000/svg"
      css={{ marginLeft: 10, marginTop: 6 }}
    >
      <path
        css={{}}
        d="M1.524.938l23.092 14.21a1 1 0 0 1 0 1.704L1.524 31.062A1 1 0 0 1 0 30.21V1.79A1 1 0 0 1 1.524.938z"
        fill="#3c90ff"
        fillRule="evenodd"
      />
    </svg>
  </button>
);

const VideoCta = () => (
  <div css={mq({ position: 'relative', marginLeft: [40] })}>
    <svg
      css={{ position: 'absolute', top: 0, left: 0 }}
      width="35"
      height="36"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#000" fillRule="nonzero">
        <path d="M34.376 36a.657.657 0 0 1-.19-.029c-.281-.088-28.038-9.063-30.184-35.31a.615.615 0 0 1 .574-.658.618.618 0 0 1 .671.562c2.079 25.42 29.046 34.157 29.318 34.244a.61.61 0 0 1 .405.77.625.625 0 0 1-.593.421z" />
        <path d="M.623 9a.65.65 0 0 1-.31-.079.57.57 0 0 1-.229-.805L5.01 0l7.695 4.505c.292.17.383.535.202.812a.643.643 0 0 1-.859.192L5.452 1.65 1.168 8.707A.646.646 0 0 1 .623 9z" />
      </g>
    </svg>
    <p css={{ paddingLeft: 54, paddingTop: 24 }}>
      Click to see how to get a "Hello World" app up and running in under 3 minutes with the
      Keystone 5 CLI.
    </p>
  </div>
);

export { VideoIntro };
