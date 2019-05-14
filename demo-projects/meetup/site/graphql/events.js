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
