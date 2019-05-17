/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';

function validateRsvp({ userRsvps, eventRsvps, event }) {
  if (!event || !event.isRsvpAvailable) {
    return 'Rsvp is not available';
  }

  if (new Date() > new Date(event.startTime)) {
    return 'You can no longer rsvp to this event';
  }

  if (event.maxRsvps !== null && eventRsvps.length >= event.maxRsvps && !userRsvps.length) {
    return 'You can no longer rsvp to this event';
  }
}

const Rsvp = ({ eventId, children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return children({ error: 'Please login to RSVP' });
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: eventId, user: user.id }}>
      {({ data, loading, error }) => {
        if (loading && !data) return children({ loading });
        if (error) return children({ error });

        const { userRsvps, eventRsvps, event } = data;

        const errorMessage = validateRsvp({ userRsvps, eventRsvps, event });

        if (errorMessage) {
          return children({ error: errorMessage });
        }

        return (
          <Mutation
            mutation={userRsvps[0] ? UPDATE_RSVP : ADD_RSVP}
            refetchQueries={({ data }) => {
              if (!data.updateRsvp) {
                return [
                  {
                    query: GET_RSVPS,
                    variables: { event: eventId, user: user.id },
                  },
                ];
              } else {
                return [];
              }
            }}
          >
            {(updateRsvp, { error: mutationError }) => {
              if (mutationError) {
                return children({ error: mutationError });
              }

              const rsvpToEvent = status =>
                updateRsvp({
                  variables: {
                    rsvp: userRsvps[0] ? userRsvps[0].id : null,
                    event: eventId,
                    user: user.id,
                    status,
                  },
                });

              const isGoing = userRsvps[0] ? userRsvps[0].status === 'yes' : false;
              const canRsvp = eventRsvps.length < event.maxRsvps;

              return children({ isGoing, canRsvp, rsvpToEvent });
            }}
          </Mutation>
        );
      }}
    </Query>
  );
};

export default Rsvp;
