/** @jsx jsx */

import { Query } from 'react-apollo';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Avatar, Container, Error, H1, H2, H3, Html, Loading } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { colors, gridSize } from '../theme';
import { GET_ORGANISERS } from '../graphql/organisers';
import { mq } from '../helpers/media';

const { publicRuntimeConfig } = getConfig();

export default function About() {
  const { meetup } = publicRuntimeConfig;

  return (
    <>
      <Meta title="About" description={meetup.aboutIntro} />
      <Navbar background="white" />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H1 hasSeparator css={{ marginBottom: '0.66em' }}>
          About
        </H1>
        {meetup.aboutIntro && (
          <Content>
            <Html markup={meetup.aboutIntro} />
          </Content>
        )}
        <Query query={GET_ORGANISERS}>
          {({ data, loading, error }) => {
            if (loading) return <Loading />;
            if (error) return <Error error={error} />;

            const hasOrganisers = Boolean(data.allOrganisers && data.allOrganisers.length);

            if (!hasOrganisers) {
              return null;
            }

            const allOrganisers = data.allOrganisers.filter(o => o.user).map(o => o.user);

            return (
              <OrganiserList
                title={
                  <H3 size={5} css={{ marginBottom: '0.66em' }}>
                    Organisers
                  </H3>
                }
              >
                {allOrganisers.map(organiser => {
                  return <Organiser key={organiser.id} organiser={organiser} />;
                })}
              </OrganiserList>
            );
          }}
        </Query>

        {meetup.codeOfConduct ? (
          <Content>
            <H2 hasSeparator css={{ marginBottom: '0.66em', marginTop: '1.22em' }}>
              Code of Conduct
            </H2>
            <Html markup={meetup.codeOfConduct} />
          </Content>
        ) : null}
      </Container>
      <Footer />
    </>
  );
}

const twitterLink = handle => `https://twitter.com/${handle.slice(1)}`;

const OrganiserList = ({ title, ...props }) => (
  <div
    css={mq({
      backgroundColor: colors.greyLight,
      padding: '1.5rem',
    })}
  >
    {title}
    <ul
      css={mq({
        display: 'flex',
        flexDirection: ['column', 'row'],
        justifyContent: 'space-between',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      })}
      {...props}
    />
  </div>
);
const Organiser = ({ organiser }) => (
  <li
    css={mq({
      display: 'flex',
      listStyle: 'none',
      margin: 0,
      padding: 0,

      ':not(:first-of-type)': {
        marginTop: ['1em', 0],
      },
    })}
  >
    <Avatar name={organiser.name} src={organiser.image && organiser.image.small} />
    <div css={{ marginLeft: '1em' }}>
      <div css={{ fontWeight: 'bold' }}>{organiser.name}</div>
      {organiser.twitterHandle && (
        <a
          css={{ color: colors.greyDark }}
          href={twitterLink(organiser.twitterHandle)}
          target="_blank"
        >
          {organiser.twitterHandle}
        </a>
      )}
    </div>
  </li>
);
const Content = props => <div css={{ maxWidth: 720 }} {...props} />;
