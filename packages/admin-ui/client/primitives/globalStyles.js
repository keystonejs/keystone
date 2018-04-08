/* eslint-disable no-unused-expressions */
import { injectGlobal } from 'emotion';

injectGlobal`
  * {
    box-sizing: border-box;
  }
  body {
    background-color: #fafafa;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    margin: 0;
  }
  a {
    color: #1385e5;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
