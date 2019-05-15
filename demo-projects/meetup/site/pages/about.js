/** @jsx jsx */

import { Query } from 'react-apollo';
import getConfig from 'next/config';
import Head from 'next/head';
import { jsx } from '@emotion/core';

import { Avatar, Container, Error, H1, H2, Html, Loading } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { borderRadius, colors, gridSize } from '../theme';
import { GET_ORGANISERS } from '../graphql/organisers';

const { publicRuntimeConfig } = getConfig();

export default function About() {
  const { meetup } = publicRuntimeConfig;

  return (
    <>
      <Head>
        <title>About | {meetup.name}</title>
        <meta name="description" content={meetup.aboutIntro} />
      </Head>
      <Navbar background="white" foreground={colors.greyDark} />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H1>About</H1>
        {meetup.aboutIntro && <Html markup={meetup.aboutIntro} />}
        <Query query={GET_ORGANISERS}>
          {({ data, loading, error }) => {
            if (loading) return <Loading />;
            if (error) return <Error error={error} />;

            const allOrganisers = data.allOrganisers.map(o => o.user);

            return (
              <OrganiserList>
                {allOrganisers.map(organiser => {
                  return <Organiser organiser={organiser} />;
                })}
              </OrganiserList>
            );
          }}
        </Query>

        {meetup.codeOfConduct ? (
          <>
            <H2>Code of Conduct</H2>
            <Html markup={meetup.codeOfConduct} />
          </>
        ) : null}
      </Container>
      <Footer />
    </>
  );
}

const twitterLink = handle => `https://twitter.com/${handle.slice(1)}`;

const OrganiserList = props => (
  <ul
    css={{
      backgroundColor: colors.greyLight,
      borderRadius,
      display: 'flex',
      justifyContent: 'space-between',
      listStyle: 'none',
      margin: 0,
      padding: '1.5rem',
    }}
    {...props}
  />
);
const Organiser = ({ organiser }) => (
  <li
    css={{
      display: 'flex',
      justifyContent: 'space-between',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    }}
    key={organiser.id}
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
