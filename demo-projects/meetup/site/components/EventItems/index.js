/** @jsx jsx */
import { jsx } from '@emotion/core';

import EventItem from './EventItem';
import { gridSize } from '../../theme';

const EventItems = ({ events, ...props }) => {
  return (
    <ul
      css={{
        display: 'flex',
        flexWrap: 'wrap',
        // horizontal offset to counter for padding between items inside!
        marginLeft: -gridSize,
        marginRight: -gridSize,
        padding: 0,
        listStyle: 'none',
      }}
      {...props}
    >
      {events.map(event => (
        <EventItem key={event.id} {...event} />
      ))}
    </ul>
  );
};

export default EventItems;
