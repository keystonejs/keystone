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
          <AvatarStack users={talk.speakers} />
          <Content>
            <H5 as="h3">
              {talk.isLightningTalk && '⚡️ '}
              {talk.name}
            </H5>
            {talks.description ? <Html markup={talk.description} /> : null}
            <Byline speakers={talk.speakers} />
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
    }}
    {...props}
  />
);
const Content = props => (
  <div
    css={{
      marginLeft: '1em',
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
