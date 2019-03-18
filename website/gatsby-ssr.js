import { renderToString } from 'react-dom/server';
import { renderStylesToString } from 'emotion-server';

export const replaceRenderer = ({ replaceBodyHTMLString, bodyComponent }) => {
  replaceBodyHTMLString(renderStylesToString(renderToString(bodyComponent)));
};
