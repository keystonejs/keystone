/* eslint-disable no-unused-expressions */
import { fontFamily, fontSize, colors } from './theme';

export default `
  body {
    background-color: ${colors.page};
    color: ${colors.text};
    font-family: ${fontFamily};
    font-size: ${fontSize}px;
    letter-spacing: -0.005em;
    margin: 0;
    text-decoration-skip: ink;
    text-rendering: optimizeLegibility;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    -moz-font-feature-settings: "liga" on;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }
  a {
    color: ${colors.primary};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  #app {
    display: flex;
    flex-flow: row nowrap;
  }
  main{
    flex: 1;
  }
`;
