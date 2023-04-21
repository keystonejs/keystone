/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import { useMediaQuery } from '../lib/media';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/content/MWrapper';
import { Quote } from '../components/content/Quote';
import { Type } from '../components/primitives/Type';
import { Pill } from '../components/content/Pill';
import { Page } from '../components/Page';
import { ContactForm } from '../components/ContactForm';
import { CustomerCard } from '../components/content/CustomerCard';
import { VocalLogo } from '../components/icons/VocalLogo';
import { PJohnsonLogo } from '../components/icons/PJohnsonLogo';
import { DFATLogo } from '../components/icons/DFATLogo';
import { EnliticLogo } from '../components/icons/EnliticLogo';
import { RugbyAuLogo } from '../components/icons/RugbyAuLogo';
import { WestpacLogo } from '../components/icons/WestpacLogo';
import { PrintBarLogo } from '../components/icons/PrintBarLogo';
import { IntroHeading, IntroLead, IntroWrapper } from '../components/content/Intro';

const customers = [
  {
    icon: VocalLogo,
    title: 'Vocal',
    copy: 'Large scale creator and content platform.',
  },
  {
    icon: PJohnsonLogo,
    title: 'PJohnson Tailors',
    copy: 'Powering PJT’s custom order and delivery business system',
  },
  {
    icon: DFATLogo,
    title: `Dep't of Foreign Affairs & Trade`,
    accessibleTitle: 'Department of Foreign Affairs and Trade',
    copy: 'Powering the Australian Free Trade Agreements website',
  },
  {
    icon: EnliticLogo,
    title: 'Enlitic',
    copy: 'Supporting Enlitic’s Medical Annotation Platform and PACS.',
  },
  {
    icon: RugbyAuLogo,
    title: 'Rugby Australia',
    copy: 'The home of the latest Rugby news, teams, fixtures & results',
  },
  {
    icon: WestpacLogo,
    title: 'Westpac',
    copy: 'Providing content management for Westpac’s GEL',
  },
  {
    icon: PrintBarLogo,
    title: 'The Print Bar',
    copy: 'Powering The Print Bar’s custom design and ordering platform.',
  },
];

export default function ForOrganisations() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'KeystoneJS for Content Management'}
      description={
        'Discover how Keystone’s Admin UI is a natural extension of how you work in code, and has the flexibility you need to enable content creatives.'
      }
    >
      <MWrapper>
        <Pill grad="grad5">Keystone for Enterprise</Pill>

        <IntroWrapper>
          <IntroHeading>
            Keystone support <Highlight look="grad6">from the people who built it</Highlight>{' '}
          </IntroHeading>
          <IntroLead>
            Keystone is developed and maintained by Thinkmill, an Australian software design and
            development consultancy. Thinkmill has been building and scaling Keystone apps since
            2013 and can provide flexible, tailored, and hands-on support for your Keystone project.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: 'flex',
            flexDirection: 'column',
            gap: '5rem',
            alignItems: 'center',
            paddingTop: '5rem',
          })}
        >
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
            }}
          >
            <Type as="h2" look="body18bold" color="var(--muted)">
              A few of the teams we're already supporting:
            </Type>

            <ul
              css={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
              role="list"
            >
              {customers.map(({ icon, accessibleTitle, title, copy }) => (
                <li key={title}>
                  <CustomerCard title={title} icon={icon} accessibleTitle={accessibleTitle}>
                    {copy}
                  </CustomerCard>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Quote
          name="Kevin Stafford"
          img="https://thinkmill.com.au/_astro/kevin-stafford-rugby-au@1280w.24c4530d.webp"
          title="CTO, Rugby Australia"
          grad="grad6"
          css={{
            marginTop: '5rem',
          }}
        >
          Since moving from Sitecore to Keystone 6, development and site performance have never been
          faster. We integrated live scores seamlessly with our new GraphQL API, and the Document
          field has transformed our Design System and content workflows.
        </Quote>

        <div
          css={{
            maxWidth: '33.75rem',
            margin: '5rem auto 0',
          }}
        >
          <ContactForm
            stacked
            css={mq({
              '& button': {
                justifySelf: ['center', 'auto'],
              },
            })}
          >
            <Type as="h2" look="heading64" margin="3rem 0">
              Speak to the makers <Highlight look="grad6">today.</Highlight>
            </Type>
          </ContactForm>
        </div>
      </MWrapper>
    </Page>
  );
}
