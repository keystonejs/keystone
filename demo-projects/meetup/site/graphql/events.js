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
        image {
          publicUrl
        }
      }
    }
  }
`;

export const GET_CURRENT_EVENTS = gql`
  query GetCurrentEvents($now: DateTime!) {
    upcomingEvents: allEvents(
      where: { startTime_not: null, status: active, startTime_gte: $now }
      orderBy: "startTime_DESC"
    ) {
      ...EventData
    }
    previousEvents: allEvents(
      where: { startTime_not: null, status: active, startTime_lte: $now }
      orderBy: "startTime_ASC"
    ) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export const GET_ALL_EVENTS = gql`
  {
    allEvents(where: { startTime_not: null, status: active }, orderBy: "startTime_DESC") {
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
    allRsvps(where: { event: { id: $event } }) {
      id
      user {
        name
        image {
          publicUrl
        }
      }
    }
  }
  ${EVENT_DATA}
`;
