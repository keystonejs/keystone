/** @jsx jsx */

import { Fragment } from 'react';
import { jsx, Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { BlogLayout, Content } from '../templates/layout';
import { HomepageFooter } from '../components/homepage/HomepageFooter';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

const Blog = ({ pageContext, uri }) => {
  const { group, index, first, last, pageCount, name } = pageContext;
  const previousUrl = index - 1 == 1 ? '/' : (index - 1).toString();
  const nextUrl = (index + 1).toString();

  return (
    <Fragment>
      <BlogLayout>
        {({ sidebarIsVisible, toggleSidebar }) => (
          <Fragment>
            <Container hasGutters={false} css={{ display: 'flex' }}>
              <Sidebar />
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
                  {name}
                </h1>
                <HomepageFooter />
              </Content>
            </Container>
          </Fragment>
        )}
      </BlogLayout>
    </Fragment>
  );
};

export default Blog;
