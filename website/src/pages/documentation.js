/** @jsx jsx */

import { Fragment } from 'react';
import { jsx, Global } from '@emotion/core';
import { Link } from 'gatsby';
import { globalStyles, colors } from '@arch-ui/theme';
import { Layout, Content } from '../templates/layout';
import { HomepageFooter } from '../components/homepage/HomepageFooter';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

const HeadingLink = ({ to, children }) => (
  <h2>
    <Link
      css={{
        color: colors.N80,
      }}
      to={to}
    >
      {children}
    </Link>
  </h2>
);

const DocsPage = () => {
  return (
    <Fragment>
      <Layout>
        {({ sidebarIsVisible, toggleSidebar }) => (
          <Fragment>
            <Container hasGutters={false} css={{ display: 'flex' }}>
              <Sidebar isVisible={sidebarIsVisible} toggleSidebar={toggleSidebar} />
              <Content css={{ paddingRight: '2rem' }}>
                <Global styles={globalStyles} />
                <h1
                  css={{
                    fontSize: '4rem',
                    padding: '0.5rem 1rem',
                    '@media min-width: 800px': { padding: '2rem 4rem' },
                    textTransform: 'capitalize',
                  }}
                >
                  Keystone Documentation
                </h1>
                <p>
                  Welcome to the Keystone documentation! If you're new, we recommend checking out
                  our <Link to="/quick-start/">getting started guide</Link>.
                </p>
                <p>Otherwise, we have divided our documentation into three key sections:</p>
                <HeadingLink to="/tutorials">Tutorials</HeadingLink>
                <p>
                  Each of these tutorials will walk you through doing a particular task with
                  Keystone. They are designed to allow you to follow along, but don't delve into all
                  available options.
                </p>
                <HeadingLink to="/guides">Guides</HeadingLink>
                <p>
                  Guides go deeper on a single topic, providing information on multiple ways to do a
                  task, and when certain options may be best used.
                </p>
                <HeadingLink to="/api">API Documentation</HeadingLink>
                <p>
                  Our API documentation will answer any questions on particular functions and
                  libraries and config we give you.
                </p>
                <HeadingLink to="/blog">Blog</HeadingLink>
                <p>
                  To keep up with what's coming out in Keystone, and what we are working on, you can
                  follow our blog (as well as our changelogs).
                </p>
                <p>Happy coding!</p>
                <HomepageFooter />
              </Content>
            </Container>
          </Fragment>
        )}
      </Layout>
    </Fragment>
  );
};

export default DocsPage;
