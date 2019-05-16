// User

const size = 70;

export const USER_IMAGE = `
  fragment UserImage on User {
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
  }
`;
