/* eslint-disable no-unused-expressions */
import { injectGlobal } from 'emotion';
import {
  pageBackgroundColor,
  fontFamily,
  fontSize,
  primaryColor,
} from '../theme';

console.log(fontFamily);

injectGlobal`
  * {
    box-sizing: border-box;
  }
  body {
    background-color: ${pageBackgroundColor};
    font-family: ${fontFamily};
    font-size: ${fontSize}px;
    margin: 0;
  }
  a {
    color: ${primaryColor};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
