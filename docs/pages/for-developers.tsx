/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../lib/media';
// import { CodeWindow, WindowWrapper, WindowL, WindowR } from '../components/marketing/CodeWindow';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/marketing/Intro';
import { CommunityCta } from '../components/marketing/CommunityCta';
import { FrontEndLogos } from '../components/icons/FrontEndLogos';
// import { Organization } from '../components/icons/Organization';
import { Highlight } from '../components/primitives/Highlight';
// import { WhyKeystone } from '../components/icons/WhyKeystone';
import { MWrapper } from '../components/marketing/MWrapper';
// import { Relational } from '../components/icons/Relational';
// import { TweetBox } from '../components/marketing/TweetBox';
// import { InlineCode } from '../components/primitives/Code';
// import { Automated } from '../components/icons/Automated';
import { Section } from '../components/marketing/Section';
// import { Thinkmill } from '../components/icons/Thinkmill';
import { CodeBox } from '../components/marketing/CodeBox';
// import { Migration } from '../components/icons/Migration';
import { Button } from '../components/primitives/Button';
// import { EndCta } from '../components/marketing/EndCta';
// import { Emoji } from '../components/primitives/Emoji';
// import { Content } from '../components/icons/Content';
// import { Updates } from '../components/icons/Updates';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
// import { Custom } from '../components/icons/Custom';
// import { Filter } from '../components/icons/Filter';
import { Pill } from '../components/marketing/Pill';
// import { Shield } from '../components/icons/Shield';
// import { Watch } from '../components/icons/Watch';
// import { Code } from '../components/icons/Code';
// import { Tick } from '../components/icons/Tick';
// import { Lab } from '../components/icons/Lab';
import { Page } from '../components/Page';

export default function ForDevelopers() {
  const mq = useMediaQuery();

  return (
    <Page>
      <MWrapper>
        <Pill grad="grad3">Keystone for developers</Pill>
        <IntroWrapper>
          <IntroHeading>
            The <Highlight look="grad3">ideal backend </Highlight> for your favourite frontend
          </IntroHeading>
          <IntroLead>
            Build sophisticated experiences with a framework that saves time and won't lock you in.
            Design APIs on the fly, give editors what they need, and ship to any frontend you like.
            All in version controllable code.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: ['grid', 'inline-grid'],
            gridTemplateColumns: ['1fr', 'auto 1fr'],
            alignItems: 'stretch',
            gap: '1rem',
            marginTop: '2.5rem',
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
          <FrontEndLogos
            css={{
              height: '2rem',
              color: 'var(--muted)',
              marginTop: '2rem',
            }}
          />
        </div>

        <Section>
          <Type as="h2" look="heading36">
            Built with the best of the modern web
          </Type>
          [logo] [logo] [logo] [logo] [logo]
        </Section>

        <Section>[picture] text</Section>

        <Section>text [picture]</Section>

        <Section>[picture] text</Section>

        <Section>
          <Type as="h2" look="heading30">
            Start learning today
          </Type>
          [logo] [logo] [logo] [logo] [logo]
        </Section>

        <Section>
          <Type as="h2" look="heading36">
            Built with the best of the modern web
          </Type>
          buttons buttons buttons
        </Section>

        <CommunityCta />

        <Section>TweetBox TweetBox TweetBox TweetBox</Section>
      </MWrapper>
    </Page>
  );
}
