/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Link } from '../../../routes';
import { H2 } from '../../primitives/Typography';
import { colors, gridSize, shadows } from '../../theme';
import { isInFuture, formatPastDate, formatFutureDate } from '../../helpers';

const EventItem = ({ id, name, startTime, description, talks, themeColor, ...props }) => {
  const prettyDate = isInFuture(startTime)
    ? formatFutureDate(startTime)
    : formatPastDate(startTime);

  // Breakpoints for the events grid
  const breakpoints = [670, 890];
  const mq = breakpoints.map(bp => `@media (min-width: ${bp}px)`);

  return (
    <li
      css={{
        width: '100%',
        [mq[0]]: {
          width: '50%',
        },
        [mq[1]]: {
          width: `${100 / 3}%`,
        },
      }}
      {...props}
    >
      <div
        css={{
          margin: gridSize,
          padding: gridSize * 3,
          backgroundColor: 'white',
          borderTop: `solid 8px ${themeColor || colors.greyLight}`,
          boxShadow: shadows.lg,
          transition: 'all 0.1s',
          '&:hover': {
            boxShadow: shadows.sm,
            transform: 'translateY(2px)',
          },
        }}
      >
        <Link route="event" params={{ id }}>
          <a css={{ color: 'inherit', textDecoration: 'none', ':hover': { cursor: 'pointer' } }}>
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
            <Link route="event" params={{ id }}>
              <a css={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
                Find out more
              </a>
            </Link>
          </a>
        </Link>
      </div>
    </li>
  );
};

export default EventItem;
