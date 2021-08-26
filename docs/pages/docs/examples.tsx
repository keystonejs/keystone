/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Examples } from '../../components/docs/ExamplesList';
import { GitHubExamplesCTA } from '../../components/docs/GitHubExamplesCTA';
import { Type } from '../../components/primitives/Type';
import { DocsPage } from '../../components/Page';

export default function Docs() {
  return (
    <DocsPage
      noRightNav
      noProse
      title={'Examples'}
      description={
        'A growing collection of projects you can run locally to learn more about Keystone’s many features. Use them as a reference for best practice, and springboard when adding features to your own project.'
      }
    >
      <Type as="h1" look="heading64">
        Examples
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Keystone has a wide range of highly configurable features. Our examples are a growing
        collection of projects you can run locally to learn more about a particular feature of
        Keystone.
      </Type>

      <Type as="p" look="body18" margin="1.25rem 0 1.5rem 0">
        Every project comes with its own docs that explain the how and why. They're useful as a
        reference for best practice, and as a jumping off point when adding features to your own
        Keystone project.
      </Type>

      <GitHubExamplesCTA />

      <Examples />
    </DocsPage>
  );
}
