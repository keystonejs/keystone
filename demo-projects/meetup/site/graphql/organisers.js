import gql from 'graphql-tag';

const size = 70;

export const GET_ORGANISERS = gql`
  query {
    allOrganisers{
      user {
        id
        image {
          small: publicUrlTransformed(
            transformation: {
              crop: "thumb"
              gravity: "face"
              quality: "auto:best"
              # Double size so that we get nice images on hi-dpi screens
              width: "${size * 2}"
              height: "${size * 2}"
            }
          )
        }
        name
        twitterHandle
      }
    }
  }
`;
