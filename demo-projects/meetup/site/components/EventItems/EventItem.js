/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Link } from '../../../routes';
import { Html } from '../../primitives';
import { H2 } from '../../primitives/Typography';
import { colors, gridSize, shadows } from '../../theme';
import { isInFuture, formatPastDate, formatFutureDate, getBreakpoints } from '../../helpers';

const mq = getBreakpoints();

const EventItem = ({
  id,
  name,
  startTime,
  description,
  talks,
  themeColor,
  locationAddress,
  maxRsvps,
  ...props
}) => {
  const prettyDate = isInFuture(startTime)
    ? formatFutureDate(startTime)
    : formatPastDate(startTime);

  return (
    <li
      css={{
        width: '100%',
        [mq[0]]: {
          width: '50%',
        },
        [mq[2]]: {
          width: `${100 / 3}%`,
        },
      }}
      {...props}
    >
      <div
        css={{
          position: 'relative',
          margin: gridSize,
          padding: gridSize * 3,
          backgroundColor: 'white',
          borderTop: `solid 8px ${themeColor || colors.greyLight}`,
          boxShadow: shadows.md,
          transition: 'all 0.1s',
          '&:hover': {
            boxShadow: shadows.sm,
            transform: 'translateY(2px)',
          },
        }}
      >
        <div
          css={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: 'linear-gradient( rgba(255, 255, 255, 0), 3%, white, 80%, white)',
            width: '100%',
            height: gridSize * 16,
          }}
        />
        <Link route="event" params={{ id }}>
          <a css={{ color: 'inherit', textDecoration: 'none', ':hover': { cursor: 'pointer' } }}>
            <div
              css={{
                opacity: isInFuture(startTime) ? 1 : 0.5,
              }}
            >
              <span css={{ textTransform: 'uppercase', fontWeight: 600 }}>{prettyDate}</span>
              <H2
                size={4}
                css={{ wordWrap: 'break-word', lineHeight: '1.25', marginBottom: gridSize }}
              >
                {name}
              </H2>
            </div>
            <div
              css={{
                maxHeight: '270px',
                overflow: 'hidden',
              }}
            >
              <Html markup={description} />
            </div>
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

            <span
              css={{
                color: 'inherit',
                fontWeight: 600,
                textDecoration: 'underline',
                position: 'relative',
              }}
            >
              Find out more
            </span>
          </a>
        </Link>
      </div>
    </li>
  );
};

export default EventItem;
