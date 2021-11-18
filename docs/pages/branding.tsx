/** @jsx jsx  */
import { jsx } from '@emotion/react';

import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/content/MWrapper';
import { Download } from '../components/icons/Download';
import { Keystone } from '../components/icons/Keystone';
import { EndCta } from '../components/content/EndCta';
import { Type } from '../components/primitives/Type';
import { Pill } from '../components/content/Pill';
import { Nope } from '../components/icons/Nope';
import { Tick } from '../components/icons/Tick';
import { useMediaQuery } from '../lib/media';
import { Page } from '../components/Page';

export default function Brand() {
  const mq = useMediaQuery();

  return (
    <Page title="KeystoneJS Brand" description="Keystones brand assets and guidelines">
      <MWrapper>
        <Pill grad="grad1">Keystone branding</Pill>
        <IntroWrapper>
          <IntroHeading>
            Keystone logos
            <br />
            <Highlight look="grad1">& brand assets</Highlight>
          </IntroHeading>
          <IntroLead>
            TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
            TODO TODO TODO TODO TODO TODO TODO TODO TODO
          </IntroLead>
        </IntroWrapper>

        <div
          css={{
            marginTop: '2.5rem',
          }}
        >
          <a
            href="https://keystonejs.s3.amazonaws.com/framework-assets/211108-KeystoneJS-logos.zip"
            target="_blank"
            rel="noopener noreferrer"
            download
            css={{
              display: 'block',
              padding: '1.5rem',
              maxWidth: '20rem',
              color: '#fff',
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
              Do this
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
                  Sdf dsf sdkfhbdskhfg kdafsldasfg ldksfg ldsakjfg ldskjg sdfh sjhfg sdkjhfg skdjhfg
                  kdsjhg fdskjhg
                </Type>
              </li>
              <li>
                <Tick grad="grad2" />
                <Type look="body18" color="var(--muted)">
                  TODO
                </Type>
              </li>
              <li>
                <Tick grad="grad2" />
                <Type look="body18" color="var(--muted)">
                  TODO
                </Type>
              </li>
            </ul>
          </div>

          <div>
            <Type as="h2" look="heading20bold">
              Don't do this
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
                  TODO
                </Type>
              </li>
              <li>
                <Nope grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  ksdfbsdl kgsdk fsdfk ldfklbh fdskjbfgdskjb fdskj blfdskjln dadknsbfdsfnbdsfb
                  dfskjl fdskjl dsfakjl sdb df bdfsmndfs ndsfm, dsafnsdaj nsda jdfsj bdsjk f dfskl
                  hdfsbjk fnf n fdmn,dsdsfn
                </Type>
              </li>
              <li>
                <Nope grad="grad5" />
                <Type look="body18" color="var(--muted)">
                  TODO
                </Type>
              </li>
            </ul>
          </div>
        </div>

        <EndCta grad="grad1" />
      </MWrapper>
    </Page>
  );
}
