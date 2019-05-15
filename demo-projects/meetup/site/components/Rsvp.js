/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';

import { Button, Loading, Error } from '../primitives';
import { colors } from '../theme';
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

const Rsvp = ({ eventId }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <p>please login to RSVP</p>;
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: eventId, user: user.id }}>
      {({ data, loading, error }) => {
        if (loading && !data) return <Loading />;
        if (error) return <Error error={error} />;

        const { userRsvps, eventRsvps, event } = data;

        const errorMessage = validateRsvp({ userRsvps, eventRsvps, event });

        if (errorMessage) {
          return <p css={{ color: colors.greyMedium, margin: 0 }}>{errorMessage}</p>;
        }

        return (
          <Mutation
            mutation={userRsvps[0] ? UPDATE_RSVP : ADD_RSVP}
            refetchQueries={({ data }) =>
              data.updateRsvp
                ? []
                : [
                    {
                      query: GET_RSVPS,
                      variables: { event: eventId, user: user.id },
                    },
                  ]
            }
          >
            {(updateRsvp, { error: mutationError }) => {
              if (mutationError) {
                return <Error error={mutationError} />;
              }

              const variables = {
                rsvp: userRsvps[0] ? userRsvps[0].id : null,
                event: eventId,
                user: user.id,
              };

              const status = userRsvps[0] ? userRsvps[0].status : null;

              const isGoing = status === 'yes' ? true : false;
              return (
                <div>
                  <span css={{ padding: '0 1rem' }}>Will you be attending?</span>
                  <Button
                    disabled={isGoing || eventRsvps.length >= event.maxRsvps}
                    background={isGoing ? colors.purple : colors.greyLight}
                    foreground={isGoing ? 'white' : colors.greyDark}
                    css={{ marginLeft: '.5rem' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'yes' } })}
                  >
                    yes
                  </Button>
                  <Button
                    disabled={!isGoing}
                    background={!isGoing ? colors.purple : colors.greyLight}
                    foreground={!isGoing ? 'white' : colors.greyDark}
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
