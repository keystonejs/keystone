/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/marketing/MWrapper';
import { CodeBox } from '../components/marketing/CodeBox';
import { Button } from '../components/primitives/Button';
import { ArrowR } from '../components/icons/ArrowR';
import { Page } from '../components/Page';

export default function IndexPage() {
  const mq = useMediaQuery();

  return (
    <Page>
      <MWrapper>
        <IntroWrapper>
          <IntroHeading>
            The <Highlight grad="grad1">superpowered</Highlight> CMS for developers
          </IntroHeading>
          <IntroLead>
            Describe your schema, and Keystone gives you a powerful GraphQL API with a beautiful
            Admin UI for content authoring and data management.
          </IntroLead>
          <IntroLead>
            Focus on shipping the code that matters to you without sacrificing the flexibility or
            power of a bespoke back-end.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: ['grid', 'inline-grid'],
            gridTemplateColumns: ['1fr', 'auto 1fr'],
            alignItems: 'stretch',
            gap: '1rem',
          })}
        >
          <CodeBox code="yarn create keystone-app" />
          <Button
            as="a"
            href="/docs"
            look="soft"
            css={mq({ height: ['3.125rem !important', 'auto !important'] })}
          >
            Read the docs <ArrowR />
          </Button>
        </div>
      </MWrapper>
    </Page>
  );
}
