/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';

import { Button, Loading, Error } from '../primitives';
import { colors } from '../theme';
import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';

function validateRsvp({ userRsvps, eventRsvps, event }) {
  if (!event.isRsvpAvailable) {
    return 'Rsvp is not available';
  }

  if (new Date() > new Date(event.startTime)) {
    return 'You can no longer rsvp to this event';
  }

  if (event.maxRsvps !== null && eventRsvps.length >= event.maxRsvps && !userRsvps.length) {
    return 'You can no longer rsvp to this event';
  }
}

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
              if (mutationError) {
                return <Error error={mutationError} />;
              }

              const errorMessage = validateRsvp({ userRsvps, eventRsvps, event });

              if (errorMessage) {
                return <Error error={errorMessage} />;
              }

              const variables = {
                rsvp: userRsvps[0] ? userRsvps[0].id : null,
                event: id,
                user: user.id,
              };

              const status = userRsvps[0] ? userRsvps[0].status : null;

              return (
                <div>
                  <Button
                    disabled={status === 'yes' || eventRsvps.length >= event.maxRsvps}
                    color={status === 'yes' ? colors.purple : colors.greyLight}
                    css={{ marginLeft: '.5rem', color: status === 'yes' ? 'blue' : 'black' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'yes' } })}
                  >
                    yes
                  </Button>
                  <Button
                    disabled={status === 'no'}
                    color={status === 'no' ? colors.purple : colors.greyLight}
                    css={{ marginLeft: '.5rem' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'no' } })}
                  >
                    no
                  </Button>
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
