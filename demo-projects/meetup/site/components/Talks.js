/** @jsx jsx */
import { jsx } from '@emotion/core';

import { H5, Html } from '../primitives';
import { AvatarStack } from '../primitives/Avatar';
import { mq } from '../helpers/media';

const Talks = ({ talks }) => {
  return (
    <Wrapper>
      {talks.map(talk => {
        const hasSpeakers = Boolean(talk.speakers && talk.speakers.length);

        return (
          <Talk key={talk.id}>
            <div css={{ display: 'flex', alignItems: 'center' }}>
              {hasSpeakers && (
                <AvatarStack
                  users={talk.speakers}
                  size="large"
                  css={{
                    marginRight: CONTENT_GUTTER,
                  }}
                />
              )}
              {talk.isLightningTalk && <Bolt />}
              <H5 as="h3" css={{ marginLeft: hasSpeakers ? '1rem' : '0' }}>
                {talk.name}
              </H5>
            </div>
            <Content>
              {talk.description ? <Html markup={talk.description} /> : null}
              {hasSpeakers && <Byline speakers={talk.speakers} />}
            </Content>
          </Talk>
        );
      })}
    </Wrapper>
  );
};

export default Talks;

// ==============================
// Styled Components
// ==============================

const CONTENT_GUTTER = 16;

const Wrapper = props => (
  <div
    css={mq({
      display: ['block', 'flex'],
      flexWrap: 'wrap',
      marginLeft: '-1em',
      marginRight: '-1em',
    })}
    {...props}
  />
);
const Talk = props => (
  <div
    css={{
      flex: 1,
      display: 'flex',
      marginTop: '1em',
      marginLeft: '1em',
      marginRight: '1em',
      flexDirection: 'column',
      minWidth: 300,
    }}
    {...props}
  />
);
const Content = props => (
  <div
    css={{
      flex: 1,
      position: 'relative',
    }}
    {...props}
  />
);
const Bolt = props => {
  const size = 32;
  const offset = size / 4;

  return (
    <div
      css={{
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: size,
        display: 'flex',
        height: size,
        justifyContent: 'center',
        left: -(CONTENT_GUTTER + size - offset),
        position: 'absolute',
        top: -offset,
        width: size,
      }}
      {...props}
    >
      ⚡️
    </div>
  );
};
const Byline = ({ speakers, ...props }) => (
  <div {...props}>
    by{' '}
    {speakers.map((speaker, idx) => {
      let separator;
      if (idx) separator = ', ';
      if (idx + 1 === speakers.length && speakers.length !== 1) separator = ' and ';

      return (
        <span key={speaker.id}>
          {separator}
          {speaker.name}
        </span>
      );
    })}
  </div>
);
