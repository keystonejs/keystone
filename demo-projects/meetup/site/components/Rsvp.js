/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';

import { Button as ButtonPrimitive } from '../primitives';
import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';

function validateRsvp({ loading, userRsvps, eventRsvps, event }) {
  if (loading) {
    return { okay: false, message: 'RSVP is loading data...' };
  }

  if (new Date() > new Date(event.startTime)) {
    return { okay: false, message: 'This event is in the past.' };
  }

  if (!event || !event.isRsvpAvailable) {
    return { okay: false, message: 'RSVP is not available.' };
  }

  if (event.maxRsvps !== null && eventRsvps.length >= event.maxRsvps && !userRsvps.length) {
    return { okay: false, message: 'Max attendees reached.' };
  }

  return { okay: true };
}

const Rsvp = ({ children, event, themeColor }) => {
  const { isAuthenticated, user } = useAuth();
  const eventId = event.id;
  const isPast = new Date() > new Date(event.startTime);

  if (!isAuthenticated) {
    return isPast ? null : children({ component: (
        <ButtonWrapper>
          <span css={{ flex: 1 }}>Are you going?</span>
          <Button route="/signin">Attending</Button>
        </ButtonWrapper>
      )
    });
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: eventId, user: user.id }}>
      {({ data, loading, error }) => {
        if (error) {
          console.error(error);
          return null;
        }

        const { userRsvps, eventRsvps, event } = data;
        const { okay, message } = validateRsvp({ loading, userRsvps, eventRsvps, event });

        if (!okay) {
          return children({ message });
        }

        const refetch = () => [
          {
            query: GET_RSVPS,
            variables: { event: eventId, user: user.id },
          },
        ];

        return (
          <Mutation
            mutation={userRsvps[0] ? UPDATE_RSVP : ADD_RSVP}
            refetchQueries={refetch}
          >
            {(updateRsvp, { error: mutationError }) => {
              if (mutationError) {
                console.error(mutationError);
                return children({ message: mutationError.message });
              }

              const doRespond = status =>
                updateRsvp({
                  variables: {
                    rsvp: userRsvps[0] ? userRsvps[0].id : null,
                    event: eventId,
                    user: user.id,
                    status,
                  },
                });
              const respondYes = () => doRespond('yes');
              const respondNo = () => doRespond('no');

              const isGoing = userRsvps[0] ? userRsvps[0].status === 'yes' : false;
              const canRsvp = eventRsvps.length < event.maxRsvps;

              return children({ component: (
                <ButtonWrapper>
                  <span css={{ padding: '0', flex: 1 }}>Are you going?</span>
                  <Button
                    disabled={isGoing || !canRsvp}
                    isSelected={isGoing && canRsvp}
                    background={themeColor}
                    onClick={respondYes}
                  >
                    yes
                  </Button>
                  <Button
                    disabled={!isGoing}
                    isSelected={!isGoing && canRsvp}
                    background={themeColor}
                    onClick={respondNo}
                  >
                    no
                  </Button>
                </ButtonWrapper>
              ) });
            }}
          </Mutation>
        );
      }}
    </Query>
  );
};

Rsvp.defaultProps = {
  children: () => null
};

const ButtonWrapper = props => (
  <div css={{
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    minHeight: 40, // NOTE: stop jumping around when no buttons
  }} {...props} />
);

const Button = ({ background, isSelected, ...props }) => (
  <ButtonPrimitive
    background={isSelected ? background : null}
    css={{ marginLeft: '0.5em' }}
    outline={!isSelected}
    size="small"
    {...props}
  />
);

export default Rsvp;
