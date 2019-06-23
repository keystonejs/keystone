export default `
  type
  originalUrl
  version
  title
  cacheAge
  provider {
    name
    url
  }
  author {
    name
    url
  }
  thumbnail {
    url
    width
    height
  }
  ...on OEmbedPhoto {
    url
    width
    height
  }
  ...on OEmbedVideo {
    html
    width
    height
  }
  ...on OEmbedRich {
    html
    width
    height
  }
`;
