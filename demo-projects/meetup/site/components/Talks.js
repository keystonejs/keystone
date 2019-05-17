/** @jsx jsx */
import { jsx } from '@emotion/core';

import { H5, Html } from '../primitives';
import { AvatarStack } from '../primitives/Avatar';
import { mq } from '../helpers/media';

const Talks = ({ talks }) => {
  return (
    <Wrapper>
      {talks.map(talk => (
        <Talk key={talk.id}>
          <div css={{ display: 'flex', alignItems: 'center' }}>
            {talk.speakers.length ? <AvatarStack users={talk.speakers} /> : null}
            <H5 as="h3" css={{ marginLeft: talk.speakers.length ? '1rem' : '0' }}>
              {talk.isLightningTalk && '⚡️ '}
              {talk.name}
            </H5>
          </div>
          <Content>
            {talk.description ? <Html markup={talk.description} /> : null}
            {talk.speakers.length ? <Byline speakers={talk.speakers} /> : null}
          </Content>
        </Talk>
      ))}
    </Wrapper>
  );
};

export default Talks;

// styled components

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
    }}
    {...props}
  />
);
const Content = props => (
  <div
    css={{
      flex: 1,
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
