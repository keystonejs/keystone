/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { H2 } from '../primitives/Typography';
import { colors } from '../theme';
import { isInFuture, formatPastDate, formatFutureDate } from '../helpers';

const EventItem = ({
  id,
  name,
  startTime,
  description,
  talks,
  themeColor = colors.red,
  ...props
}) => {
  const prettyDate = isInFuture(startTime)
    ? formatFutureDate(startTime)
    : formatPastDate(startTime);
  return (
    <li
      css={{
        backgroundColor: 'white',
        padding: '1.5rem',
        margin: '1rem',
        boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)',
        borderTop: `solid 8px ${themeColor}`,
        listStyle: 'none',
      }}
      {...props}
    >
      <Link
        css={{
          '&:hover': {
            transform: 'translateY(3px)',
          },
        }}
        route="event"
        params={{ id }}
      >
        <a
          css={{
            color: 'inherit',
            textDecoration: 'none',
            ':hover': { cursor: 'pointer' },
          }}
        >
          <div
            css={{
              opacity: isInFuture(startTime) ? 1 : 0.5,
            }}
          >
            <span css={{ textTransform: 'uppercase', fontWeight: 600 }}>{prettyDate}</span>
            <H2 size={4}>{name}</H2>
          </div>
          <div dangerouslySetInnerHTML={{ __html: description }} />
          {/*<Rsvp id={id} />
      <h2>Talks</h2>
      {talks.map(talk => (
        <div key={talk.id}>
        <h3>{talk.name}</h3>
        <h3>Speakers</h3>
        {talk.speakers.map(speaker => (
          <p key={speaker.id}>{speaker.name}</p>
          ))}
          </div>
        ))}*/}

          <p css={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Find out more
          </p>
        </a>
      </Link>
    </li>
  );
};

export default EventItem;
