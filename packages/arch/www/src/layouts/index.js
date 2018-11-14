import { StaticQuery, graphql } from 'gatsby';
import React from 'react';
import PropTypes from 'prop-types';
import TitleAndMetaTags from '../components/titleandmetatags';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import './index.css';

require('prismjs/themes/prism-solarizedlight.css');

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query NavigationQuery {
        allMarkdownRemark(sort: { fields: [frontmatter___title], order: ASC }) {
          edges {
            node {
              id
              frontmatter {
                title
              }
              fields {
                slug
              }
              excerpt
            }
          }
        }
      }
    `}
    render={data => (
      <div>
        <TitleAndMetaTags title="KeystoneJS - 5" />
        <Header />
        <div style={{ margin: '0 auto', padding: 0, display: 'flex' }}>
          <div
            style={{
              padding: '2rem',
              flex: '1 1 auto',
              order: 1,
              maxWidth: 'calc(100vw - 300px)',
            }}
          >
            {children}
          </div>
          <Sidebar data={data} />
        </div>
      </div>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.object,
};

export default Layout;
