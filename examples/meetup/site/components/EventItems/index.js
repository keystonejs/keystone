/** @jsx jsx */
import { jsx } from '@emotion/core';

import EventItem from './EventItem';
import { gridSize } from '../../theme';
import { media } from '../../helpers/media';

const EventItems = ({ events, offsetTop, ...props }) => {
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
      {events.map((event, idx) => (
        <EventItem
          key={event.id}
          css={
            offsetTop
              ? {
                  [media.lg]: {
                    marginTop: `${idx * 10}vh`,
                  },
                }
              : null
          }
          {...event}
        />
      ))}
    </ul>
  );
};

export default EventItems;
