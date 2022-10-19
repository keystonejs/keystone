/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Page } from '../../components/Page';
import { useMediaQuery } from '../../lib/media';

export default function Docs() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'The Keystone Blog'}
      description={'Blog posts from the team maintaining KeystoneJS.'}
    >
      Hello World
    </Page>
  );
}
