import React from 'react';
import { Mutation, Query } from 'react-apollo';

import { Loading, Error } from '../primitives';
import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';

const Rsvp = ({ id }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <p>please login to RSVP</p>;
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: id, user: user.id }}>
      {({ data, loading, error }) => {
        if (loading && !data) return <Loading />;
        if (error) return <Error error={error} />;

        const { userRsvps, eventRsvps, event } = data;

        return (
          <Mutation
            mutation={userRsvps[0] ? UPDATE_RSVP : ADD_RSVP}
            refetchQueries={() => [
              {
                query: GET_RSVPS,
                variables: { event: id, user: user.id },
              },
            ]}
          >
            {(updateRsvp, { error: mutationError }) => {
              if (!event.isRsvpAvailable) {
                return <p>Rsvp is not available</p>;
              }

              if (new Date() > new Date(event.startTime)) {
                return <p>You can no longer rsvp to this event</p>;
              }

              if (
                event.maxRsvps !== null &&
                eventRsvps.length >= event.maxRsvps &&
                !userRsvps.length
              ) {
                return <p>You can no longer rsvp to this event</p>;
              }

              let variables = {
                rsvp: userRsvps[0] ? userRsvps[0].id : null,
                event: id,
                user: user.id,
              };

              let status = userRsvps[0] ? userRsvps[0].status : null;

              return (
                <div>
                  <h3>RSVP?</h3>
                  <button
                    disabled={status === 'yes' || eventRsvps.length >= event.maxRsvps}
                    style={{ color: status === 'yes' ? 'blue' : 'black' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'yes' } })}
                  >
                    Yes
                  </button>
                  <button
                    disabled={status === 'no'}
                    style={{ color: status === 'no' ? 'blue' : 'black' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'no' } })}
                  >
                    No
                  </button>
                  {eventRsvps.length >= event.maxRsvps ? (
                    <p>You can no longer rsvp to this event</p>
                  ) : null}
                  {mutationError ? <p style={{ color: 'red' }}>Error rsvping to event</p> : null}
                </div>
              );
            }}
          </Mutation>
        );
      }}
    </Query>
  );
};

export default Rsvp;
