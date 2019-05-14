/** @jsx jsx */
import { jsx } from '@emotion/core';

import Rsvp from './Rsvp';
import { Link } from '../../routes';

import { colors } from '@root/theme';

const EventItem = ({
  id,
  name,
  startTime,
  description,
  talks,
  themeColor = colors.red,
  ...props
}) => (
  <li
    css={{
      backgroundColor: 'white',
      padding: '1rem',
      margin: '1rem',
      boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)',
      borderTop: `solid 8px ${themeColor}`,
    }}
    {...props}
  >
    <span css={{ textTransform: 'uppercase', fontWeight: 600 }}>{startTime}</span>
    <h2>{name}</h2>
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
      Find out more
    </Link>
  </li>
);

export default EventItem;
