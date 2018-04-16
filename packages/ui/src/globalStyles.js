/* eslint-disable no-unused-expressions */
import { fontFamily, fontSize, colors } from './theme';

export default `
  * {
    box-sizing: border-box;
  }
  body {
    background-color: ${colors.page};
    color: ${colors.text};
    font-family: ${fontFamily};
    font-size: ${fontSize}px;
    margin: 0;
  }
  a {
    color: ${colors.primary};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
