import React from 'react';

import Rsvp from './Rsvp';
import { Link } from '../../routes';

const EventItem = ({ id, name, startDate, talks }) => (
  <li>
    <h2>{name}</h2>
    <p>{startDate}</p>
    <Rsvp id={id} />
    <h2>Talks</h2>
    {talks.map(talk => (
      <div key={talk.id}>
        <h3>{talk.name}</h3>
        <h3>Speakers</h3>
        {talk.speakers.map(speaker => (
          <p key={speaker.id}>{speaker.name}</p>
        ))}
      </div>
    ))}
    <Link route="event" params={{ id }}>
      Find out more
    </Link>
  </li>
);

export default EventItem;
