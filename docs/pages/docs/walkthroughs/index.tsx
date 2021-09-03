/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Walkthroughs } from '../../../components/docs/WalkthroughsList';
import { Type } from '../../../components/primitives/Type';
import { DocsPage } from '../../../components/Page';

export default function Docs() {
  return (
    <DocsPage
      noRightNav
      noProse
      title={'Walkthroughs'}
      description={
        'Explore tutorials with step-by-step instruction on building solutions with Keystone.'
      }
    >
      <Type as="h1" look="heading64">
        Walkthroughs
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Step-by-step instructions for getting things done with Keystone.
      </Type>

      <Walkthroughs />
    </DocsPage>
  );
}
