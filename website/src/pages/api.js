/** @jsx jsx */

import { Fragment } from 'react';
import { jsx, Global } from '@emotion/core';
import { Link } from 'gatsby';
import { globalStyles } from '@arch-ui/theme';
import { Layout, Content } from '../templates/layout';
import { HomepageFooter } from '../components/homepage/HomepageFooter';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

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
                  Keystone API Documentation
                </h1>
                <p>
                  Welcome to our API documentation. You can view pages in the navigation bar, or use
                  search to find the content you are looking for.
                </p>
                <p>
                  Our API docs have three major sections: Apps docs for the individual keystone
                  apps, Field Types docs for the API for each field type, and then more general api
                  docs, such as <Link to="/api/access-control">access control</Link>
                </p>
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
