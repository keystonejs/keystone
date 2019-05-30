import gql from 'graphql-tag';

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
