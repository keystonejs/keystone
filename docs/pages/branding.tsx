/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/content/MWrapper';
import { Download } from '../components/icons/Download';
import { Keystone } from '../components/icons/Keystone';
import { Type } from '../components/primitives/Type';
import { Pill } from '../components/content/Pill';
import { Nope } from '../components/icons/Nope';
import { Tick } from '../components/icons/Tick';
import { useMediaQuery } from '../lib/media';
import { Page } from '../components/Page';
import { Alert } from '../components/primitives/Alert';
import { Button } from '../components/primitives/Button';
import { ArrowR } from '../components/icons/ArrowR';

export default function Brand() {
  const mq = useMediaQuery();

  return (
    <Page title="KeystoneJS Brand" description="Keystones brand assets and guidelines">
      <MWrapper>
        <Pill grad="grad1">Branding</Pill>
        <IntroWrapper>
          <IntroHeading>
            Keystone logos
            <br />
            <Highlight look="grad1">& brand assets</Highlight>
          </IntroHeading>
          <IntroLead>
            The Keystone Logo and Monogram are the primary visual identifiers to use when referring
            to the Keystone project, its resources, and Keystone related integrations. Using these
            assets in a consistent manner will make it easier for people to relate to the Keystone
            brand in a unified way.
          </IntroLead>
        </IntroWrapper>

        <div
          css={{
            marginTop: '2.5rem',
          }}
        >
          <a
            href="https://keystonejs.s3.amazonaws.com/framework-assets/211123-KeystoneJS-logos.zip"
            target="_blank"
            rel="noopener noreferrer"
            download
            css={{
              display: 'block',
              padding: '1.5rem',
              maxWidth: '20rem',
              color: 'var(--app-bg)',
              background: 'linear-gradient(135deg, var(--grad1-1), var(--grad1-2))',
              borderRadius: '0.5rem',
              filter: 'saturate(80%)',
              transition: 'filter 0.3s ease',
              '&:focus,&:hover': {
                filter: 'saturate(150%)',
              },
            }}
          >
            <Keystone
              css={{
                display: 'block',
                width: '3rem',
                marginBottom: '0.75rem',
              }}
            />
            <Download
              css={{
                width: '1rem',
              }}
            />{' '}
            Download logo assets
          </a>
        </div>

        <div
          css={mq({
            display: ['block', 'inline-grid'],
            gridTemplateColumns: ['1fr', '1fr 1fr'],
            gap: ['1rem', '2rem', '3rem'],
            marginTop: '2.5rem',
          })}
        >
          <div>
            <Type as="h2" look="heading20bold">
              Use these assets to
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0 1.5rem 0',
                padding: 0,
                display: 'inline-block',
                '& li': {
                  display: 'grid',
                  gridTemplateColumns: '1.25rem auto',
                  gap: '0.5rem',
                  alignItems: 'normal',
                  marginRight: '1rem',
                  color: 'var(--muted)',
                },
                '& svg': {
                  width: '1.25rem',
                  margin: '0.4rem 0.5rem 0 0',
                },
              }}
            >
              <li>
                <Tick grad="grad2" />
                <Type look="body18" color="var(--muted)">
                  Link to the Keystone website.
                </Type>
              </li>
              <li>
                <Tick grad="grad2" />
                <Type look="body18" color="var(--muted)">
                  Reference Keystone in your own publications.
                </Type>
              </li>
              <li>
                <Tick grad="grad2" />
                <Type look="body18" color="var(--muted)">
                  Communicate that your product integrates with Keystone in some way.
                </Type>
              </li>
            </ul>
          </div>

          <div>
            <Type as="h2" look="heading20bold">
              Please don’t
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0 1.5rem 0',
                padding: 0,
                display: 'inline-block',
                '& li': {
                  display: 'grid',
                  gridTemplateColumns: '1.25rem auto',
                  gap: '0.5rem',
                  alignItems: 'normal',
                  marginRight: '1rem',
                  color: 'var(--muted)',
                },
                '& svg': {
                  width: '1.25rem',
                  margin: '0.4rem 0.5rem 0 0',
                },
              }}
            >
              <li>
                <Nope grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Use the Keystone monogram or logo for your own product or app’s icon.
                </Type>
              </li>
              <li>
                <Nope grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Modify the logo in any way (such as altering the dimensions, colours, or adding
                  other text or graphics).
                </Type>
              </li>
              <li>
                <Nope grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  Integrate the Keystone logo or monogram with a logo of your own.
                </Type>
              </li>
            </ul>
          </div>
        </div>
        <Alert css={{ margin: '2rem 0' }}>
          <span
            css={{
              display: 'inline-block',
              margin: '0 1rem 0.5rem 0',
            }}
          >
            Got a question about branding this page doesn't answer? Get help in our
          </span>
          <Button
            as="a"
            look="secondary"
            size="small"
            href="https://community.keystonejs.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Community Slack <ArrowR />
          </Button>
        </Alert>
      </MWrapper>
    </Page>
  );
}
