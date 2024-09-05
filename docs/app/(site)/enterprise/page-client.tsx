/** @jsxImportSource @emotion/react */

'use client'

import { useMediaQuery } from '../../../lib/media'
import { Highlight } from '../../../components/primitives/Highlight'
import { MWrapper } from '../../../components/content/MWrapper'
import { Quote } from '../../../components/content/Quote'
import { Type } from '../../../components/primitives/Type'
import { Pill } from '../../../components/content/Pill'
import { Page } from '../../../components/Page'
import { ContactForm } from '../../../components/ContactForm'
import { CustomerCard } from '../../../components/content/CustomerCard'
import { VocalLogo } from '../../../components/icons/VocalLogo'
import { PJohnsonLogo } from '../../../components/icons/PJohnsonLogo'
import { DFATLogo } from '../../../components/icons/DFATLogo'
import { EnliticLogo } from '../../../components/icons/EnliticLogo'
import { RugbyAuLogo } from '../../../components/icons/RugbyAuLogo'
import { WestpacLogo } from '../../../components/icons/WestpacLogo'
import { PrintBarLogo } from '../../../components/icons/PrintBarLogo'
import { IntroHeading, IntroLead, IntroWrapper } from '../../../components/content/Intro'
import { Stack } from '../../../components/primitives/Stack'

const customers = [
  {
    icon: VocalLogo,
    title: 'Vocal',
    copy: 'Large scale platform for content creators.',
    learnMoreHref: 'https://www.thinkmill.com.au/work/vocal?utm_source=keystone-site',
  },
  {
    icon: RugbyAuLogo,
    title: 'Rugby Australia',
    copy: 'Headless CMS to power 3000 websites.',
    learnMoreHref: 'https://www.thinkmill.com.au/work/rugby?utm_source=keystone-site',
  },
  {
    icon: EnliticLogo,
    title: 'Enlitic',
    copy: 'Medical Annotation Platform & PACS.',
    learnMoreHref: 'https://www.thinkmill.com.au/work/enlitic?utm_source=keystone-site',
  },
  {
    icon: DFATLogo,
    title: `Dep't of Foreign Affairs & Trade`,
    accessibleTitle: 'Department of Foreign Affairs and Trade',
    copy: 'Australia’s Free Trade Agreements website.',
  },
  {
    icon: PJohnsonLogo,
    title: 'PJohnson Tailors',
    copy: 'Custom garment order & production management system.',
  },
  {
    icon: WestpacLogo,
    title: 'Westpac',
    copy: 'Content management for Westpac’s GEL Design System.',
  },
  {
    icon: PrintBarLogo,
    title: 'The Print Bar',
    copy: 'Application backend for a custom design and ordering platform.',
  },
]

export default function ForOrganisations () {
  const mq = useMediaQuery()
  return (
    <Page>
      <MWrapper>
        <Pill grad="grad6">Keystone for Enterprise</Pill>

        <IntroWrapper>
          <IntroHeading>
            Keystone support <Highlight look="grad6">from the people who built it</Highlight>{' '}
          </IntroHeading>
          <IntroLead>
            Keystone is developed and maintained by{' '}
            <a
              href="https://thinkmill.com.au?utm_source=keystone-site"
              target="_blank"
              rel="noreferrer"
            >
              Thinkmill
            </a>{' '}
            , an Australian software design and development consultancy. We’ve been building and
            scaling Keystone apps since 2013 and can provide flexible, tailored, and hands-on
            support for your Keystone project.
          </IntroLead>
        </IntroWrapper>

        <div
          css={mq({
            display: 'flex',
            flexDirection: 'column',
            gap: '5rem',
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
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(15.625rem, 1fr))',
                gap: '2rem',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                '@media (min-width: 54rem)': {
                  gridTemplateColumns: 'repeat(3, 15.625rem)',
                },
                '@media (min-width: 85rem)': {
                  gridTemplateColumns: 'repeat(4, 15.625rem)',
                },
              }}
              role="list"
            >
              {customers.map(({ icon, accessibleTitle, title, copy, learnMoreHref }) => (
                <li key={title}>
                  <CustomerCard title={title} icon={icon} accessibleTitle={accessibleTitle}>
                    {learnMoreHref ? (
                      <span css={{ display: 'grid' }}>
                        {copy}
                        <span>
                          <a href={learnMoreHref} target="_blank" rel="noreferrer">
                            Learn more
                          </a>
                          .
                        </span>
                      </span>
                    ) : (
                      copy
                    )}
                  </CustomerCard>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Quote
          name="Kevin Stafford"
          img="/assets/kevin-stafford.jpg"
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
            maxWidth: '50rem',
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
  )
}
