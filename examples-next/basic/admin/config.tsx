/* @jsx jsx */
// import React from 'react';
import { jsx, Global, css } from '@emotion/react';

import { AdminConfig } from '@keystone-next/types';
import { Fragment } from 'react';

// import { DarkTheme } from '@keystone-next/admin-ui/themes';
// export const theme = DarkTheme;

const styles = css`
  @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');
`;

const CustomLogo = () => (
  <Fragment>
    <Global styles={styles} />
    <h1>Keystone!</h1>
  </Fragment>
);

export { theme } from './default';

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
};

// const nav = [{
//   'users',
//   { title: 'Content', children: [
//     'posts',
//     'categories',
//   ] },
// }];
