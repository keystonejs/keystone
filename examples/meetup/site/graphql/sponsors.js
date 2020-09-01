import { gql } from '@apollo/client';

export const GET_SPONSORS = gql`
  query {
    allSponsors {
      id
      name
      website
      logo {
        publicUrl
      }
    }
  }
`;
