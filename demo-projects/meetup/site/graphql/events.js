import gql from 'graphql-tag';

export const EVENT_DATA = gql`
  fragment EventData on Event {
    id
    name
    startTime
    description
    themeColor
    talks {
      id
      name
      speakers {
        id
        name
      }
    }
  }
`;

export const GET_CURRENT_EVENTS = gql`
  query GetCurrentEvents($now: DateTime!) {
    upcomingEvents: allEvents(
      where: { startTime_not: null, startTime_gte: $now }
      orderBy: "startTime_DESC"
    ) {
      ...EventData
    }
    previousEvents: allEvents(
      where: { startTime_not: null, startTime_lte: $now }
      orderBy: "startTime_ASC"
    ) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export const GET_ALL_EVENTS = gql`
  {
    allEvents {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export const GET_EVENT_DETAILS = gql`
  query GetEventDetails($event: ID!) {
    Event(where: { id: $event }) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;
