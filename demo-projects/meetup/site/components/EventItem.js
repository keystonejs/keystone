import React from 'react';
import { useAuth } from '../lib/authetication';

import Rsvp from './Rsvp';

const EventItem = ({ id, name, startDate, talks }) => {
  const { isAuthenticated } = useAuth();

  return (
    <li>
      <h2>{name}</h2>
      <p>{startDate}</p>
      {isAuthenticated ? <Rsvp id={id}/> : <p>please login to RSVP</p> }
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
    </li>
  );
};

export default EventItem;
