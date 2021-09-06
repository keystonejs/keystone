/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';

import { Page } from '../../components/Page';

export default function ThemePage() {
  return (
    <Page>
      <h1>Theme</h1>

      <h2>Customising the theme</h2>
      <p>
        If you want to change the appearance of the design system (i.e the colour schema, font
        selection, borders, size and spacing, etc) change the theme tokens.
      </p>
      <p>
        If you want to change the design of the design system (i.e how the appearance is interpreted
        given component props and state) change the component token functions.
      </p>
      <p>
        If you want to change the implementation of the design system (i.e how the tokens are
        applied to css properties for the DOM elements components render) change the style
        functions.
      </p>
      <p>
        <strong>Tip:</strong> You can generate new palettes using{' '}
        <a href="https://smart-swatch.netlify.app/">Smart Swatch</a>.
      </p>
    </Page>
  );
}
