/** @jsx jsx */
import { jsx } from '@emotion/core';

import { H3, Html, AvatarStack } from '../primitives';
import { mq } from '../helpers/media';
import { colors } from '../theme';

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
                    flexShrink: 0,
                    marginRight: CONTENT_GUTTER,
                  }}
                />
              )}
              <div css={{ position: 'relative' }}>
                {talk.isLightningTalk && <Bolt>⚡️ Lightning Talk ⚡️</Bolt>}
                <H3>{talk.name}</H3>
              </div>
            </div>
            <Content>
              <Html markup={talk.description} />
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

const CONTENT_GUTTER = 12;

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
      minWidth: 320,
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
const Bolt = props => (
  <div
    css={{
      color: colors.greyMedium,
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
    }}
    {...props}
  />
);
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
